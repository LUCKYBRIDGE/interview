import test from 'node:test';
import assert from 'node:assert/strict';
import {PANE_KEY,paneState,readPane,writePane,frameURL} from '../assets/explore-state.mjs';

test('pane preferences accept only internal routes and valid bounded positions',()=>{
  assert.deepEqual(paneState({route:'https://evil.invalid',mode:'anything',y:NaN}),{route:'home',mode:'both',y:0});
  assert.deepEqual(paneState(null),{route:'home',mode:'both',y:0});
  assert.equal(paneState({y:-40}).y,0);
  assert.equal(paneState({y:Infinity}).y,0);
  assert.equal(paneState({y:10000001}).y,10000000);
  assert.equal(paneState({y:'300'}).y,0);
  assert.equal(frameURL('walking'),'index.html?embed=1#walking');
  assert.throws(()=>frameURL('//evil.invalid'));
});
test('unavailable and corrupt preference storage do not affect recording',()=>{
  const failed={getItem(){throw Error('blocked');},setItem(){throw Error('quota');}};
  assert.equal(readPane(failed).mode,'both');assert.equal(writePane(failed,{}),false);
  assert.equal(readPane({getItem:()=>'{broken'}).route,'home');
  const saved=new Map();const store={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  assert.equal(writePane(store,{route:'study',mode:'both',y:1200}),true);
  assert.deepEqual(readPane(store),{route:'study',mode:'both',y:1200});
  assert.deepEqual([...saved.keys()],[PANE_KEY]);
});

test('fresh panes show both and explicit view preferences remain available',()=>{
  const saved=new Map();
  const storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  assert.equal(readPane(storage).mode,'both');
  assert.equal(writePane(storage,{route:'walking',mode:'writing',y:450}),true);
  assert.deepEqual(readPane(storage),{route:'walking',mode:'writing',y:450});
});
