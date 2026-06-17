import sys
import qrcode
import qrcode.image.svg
import re

cryptos = [
    ("Bitcoin", "BTC", "bc1qd35yqx3xt28dy6fd87xzd62cj7ch35p68ep3p8", "bitcoin:", "support_btc.svg"),
    ("Ethereum", "ETH", "0xA39Dfd80309e881cF1464dDb00cF0a17bF0322e3", "ethereum:", "support_eth.svg"),
    ("USDT (BNB)", "USDT", "0xA39Dfd80309e881cF1464dDb00cF0a17bF0322e3", "bsc:", "support_usdt_bnb.svg"),
    ("USDT (TRC20)", "USDT", "THMe6FdXkA2Pw45yKaXBHRnkX3fjyKCzfy", "tron:", "support_usdt.svg"),
    ("TON", "TON", "UQCp0OawnofpZTNZk-69wlqIx_wQpzKBgDpxY2JK5iynh3mC", "ton://transfer/", "support_ton.svg"),
    ("Solana", "SOL", "7NoEScTxHnmgKCNDsUGzQs2jZATZMPAz8UdcWko6Y5Gj", "solana:", "support_sol.svg")
]

# GitHub Dark Theme Colors (as per the main branch)
bg = "#0D1117"
border = "#30363D"
inner_bg = "#161b22"
text_color = "#ffffff"
desc_color = "#8b949e"

for name, symbol, address, uri_scheme, filename in cryptos:
    full_uri = f"{uri_scheme}{address}"
    
    # Generate QR Code
    factory = qrcode.image.svg.SvgPathImage
    img = qrcode.make(full_uri, image_factory=factory, box_size=10, border=2)
    qr_svg_str = img.to_string().decode('utf-8')
    
    # Extract viewBox and path
    viewbox = re.search(r'viewBox="(.*?)"', qr_svg_str).group(1)
    path_d = re.search(r'<path d="(.*?)"', qr_svg_str).group(1)
    
    # The nested SVG for the QR code, size 110x110
    # x = (140 - 110)/2 = 15, y = 12
    qr_element = f'<svg x="15" y="12" width="110" height="110" viewBox="{viewbox}"><rect width="100%" height="100%" fill="white" rx="10%" ry="10%" /><path d="{path_d}" fill="#000000" /></svg>'

    # We create a 140x150 box
    svg = f'''<svg width="140" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="139" height="149" rx="14" fill="{bg}" stroke="{border}" stroke-width="1"/>
      {qr_element}
      <text x="70" y="140" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="500" fill="{text_color}">{name}</text>
    </svg>'''
    
    with open(f'assets/{filename}', 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Successfully generated assets/{filename}")
