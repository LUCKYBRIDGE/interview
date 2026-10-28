"""Revise comparison headings and enlarge the group's final opinion box."""
from io import BytesIO
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'scripts/templates/group-11-12.pdf'
OUTPUT = ROOT / 'output/pdf/group-11-12-revised.pdf'

reader = PdfReader(SOURCE)
assert len(reader.pages) == 1
writer = PdfWriter()
writer.add_page(reader.pages[0])
page = writer.pages[0]
assert '의견을 비교하며 나온 좋은 점과 걱정되는 점' in page.extract_text()

# Remove replaced labels, including their extractable text.
stream = ContentStream(page.get_contents(), writer)
result, block = [], None
removed = 0
for operands, operator in stream.operations:
    if operator == b'BT':
        block = []
    if block is not None:
        block.append((operands, operator))
        if operator == b'ET':
            target = any(
                op == b'Td' and (
                    any(abs(float(args[-1])-y) < 0.01 for y in (430.089, 401.989, 263.339, 167.889, 101.689))
                    or (abs(float(args[0])-427.3) < 0.01 and abs(float(args[-1])-609.789) < 0.01)
                )
                for args, op in block
            )
            if target:
                removed += 1
            else:
                result.extend(block)
            block = None
    else:
        result.append((operands, operator))
assert removed == 8, f'Unexpected source layout: {removed}'
# Reuse the removed line's space as extra writing room in all four member rows.
row_edges = {561.589:557.339, 524.489:515.989, 487.389:474.639, 450.289:433.289, 449.989:432.989, 450.589:433.589}
for operands, operator in result:
    if operator in (b'm', b'l') and len(operands) == 2:
        for old_y, new_y in row_edges.items():
            if abs(float(operands[1])-old_y) < 0.001:
                from pypdf.generic import FloatObject
                operands[1] = FloatObject(new_y)
                break
stream.operations = result
page.replace_contents(stream)

pdfmetrics.registerFont(TTFont('MalgunBold', 'C:/Windows/Fonts/malgunbd.ttf'))
width, height = float(page.mediabox.width), float(page.mediabox.height)
overlay = BytesIO()
c = canvas.Canvas(overlay, pagesize=(width, height))
# Erase the two old final-writing boxes, then replace them with one larger box.
c.setFillColorRGB(1, 1, 1)
c.rect(44.5, 69, 506.5, 120, stroke=0, fill=1)
c.setFillColorRGB(0, 0, 0)
c.setFont('MalgunBold', 12.5)
c.drawString(45.45, 401.989, '02   의견 모으기 · 장단점 검토하기')
c.setFont('MalgunBold', 10)
c.drawCentredString((357.2+550)/2, 609.789, '장단점')
c.drawString(50.95, 263.339, '장점: 좋은 점과 그 이유')
c.drawString(303.2, 263.339, '단점: 걱정되는 점과 그 이유')
c.setFont('MalgunBold', 10.5)
c.drawString(50.95, 167.889, '우리 모둠의 최종 의견과 근거')
c.setStrokeColorRGB(0.7411764706, 0.7764705882, 0.8039215686)
c.setLineWidth(0.6)
# Match the original review box's border and preserve its writing area.
c.line(297.7, 282.75, 297.7, 222.75)
c.rect(45.4, 70.389, 504.6, 117.5, stroke=1, fill=0)
c.save()
overlay.seek(0)
page.merge_page(PdfReader(overlay).pages[0])
# Back side: discussion agreements and a large unruled memo box.
pdfmetrics.registerFont(TTFont('Malgun', 'C:/Windows/Fonts/malgun.ttf'))
back = BytesIO()
c = canvas.Canvas(back, pagesize=(width, height))
c.setFillColorRGB(0, 0, 0)
c.setFont('MalgunBold', 9)
c.drawString(45.45, 792.889, '우리 지역 보행 안전 토의   /   11~12차시')
c.setFont('MalgunBold', 22)
c.drawString(45.45, 752.189, '우리 모둠의 토의 약속')
c.setFont('Malgun', 13)
agreements = ['발언권 얻고 말하기', '의견을 끝까지 듣기', '이유와 근거를 들어 말하기', '서로 다른 의견을 존중하기', '충분히 협의하여 결정하기']
for i, text in enumerate(agreements):
    c.drawString(50.95, 704-i*28, '• '+text)
c.setFont('MalgunBold', 12.5)
c.drawString(45.45, 550, '자유 메모')
c.setStrokeColorRGB(0.7411764706, 0.7764705882, 0.8039215686)
c.setLineWidth(0.6)
c.rect(45.4, 70.389, 504.6, 460, stroke=1, fill=0)
c.setFont('Malgun', 9)
c.drawRightString(550, 20.789, '우리 지역 보행 안전 토의  |  2')
c.save()
back.seek(0)
writer.add_page(PdfReader(back).pages[0])
from pypdf.generic import DictionaryObject, NameObject
writer._root_object[NameObject('/ViewerPreferences')] = DictionaryObject({NameObject('/Duplex'): NameObject('/DuplexFlipLongEdge')})
writer.add_metadata({'/Title': '모둠 토의하기 - 양면 활동지'})
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with OUTPUT.open('wb') as f:
    writer.write(f)
check = PdfReader(OUTPUT)
assert len(check.pages) == 2
text = check.pages[0].extract_text()
for phrase in ['제안하는 의견', '장단점', '장단점 검토하기', '장점: 좋은 점과 그 이유', '단점: 걱정되는 점과 그 이유', '03', '의견 결정하기', '우리 모둠의 최종 의견과 근거']:
    assert phrase in text, phrase
for phrase in ['함께 집중할 문제', '의견을 비교하며 나온 좋은 점과 걱정되는 점', '중요한 이유', '친구 의견을 반영해 고치거나 더한 점', '우리 모둠의 최종 제안과 선택한 이유']:
    assert phrase not in text, phrase
for phrase in [*agreements, '자유 메모']:
    assert phrase in check.pages[1].extract_text(), phrase
print(OUTPUT)
