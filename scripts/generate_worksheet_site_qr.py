from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tmp/qr-deps'))
import qrcode
import zxingcpp

URL = 'https://luckybridge.github.io/interview/'
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=4)
qr.add_data(URL)
qr.make(fit=True)
image = qr.make_image(fill_color='black', back_color='white').convert('RGB')
assert zxingcpp.read_barcodes(image)[0].text == URL
target = ROOT / 'assets/worksheet/site-qr.png'
target.parent.mkdir(parents=True, exist_ok=True)
image.save(target)
print(target)
