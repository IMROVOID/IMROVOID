import sys

cryptos = [
    ("Bitcoin", "BTC", "bc1qd35yqx3xt28dy6fd87xzd62cj7ch35p68ep3p8", "bitcoin:", "support_btc.svg"),
    ("Ethereum", "ETH", "0xA39Dfd80309e881cF1464dDb00cF0a17bF0322e3", "ethereum:", "support_eth.svg"),
    ("USDT (TRC20)", "USDT", "THMe6FdXkA2Pw45yKaXBHRnkX3fjyKCzfy", "tron:", "support_usdt.svg"),
    ("Solana", "SOL", "9QZHMTN4Pu6BCxiN2yABEcR3P4sXtBjkog9GXNxWbav1", "solana:", "support_sol.svg"),
    ("TON", "TON", "UQCp0OawnofpZTNZk-69wlqIx_wQpzKBgDpxY2JK5iynh3mC", "ton://transfer/", "support_ton.svg")
]

# GitHub Dark Theme Colors (as per the main branch)
bg = "#0D1117"
border = "#30363D"
inner_bg = "#161b22"
text_color = "#ffffff"
desc_color = "#8b949e"

for name, symbol, address, uri_scheme, filename in cryptos:
    # We create a full-width container for each address
    # Height is 80 to match previous box height
    svg = f'''<svg width="1000" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="999" height="79" rx="12" fill="{bg}" stroke="{border}" stroke-width="1"/>
      <rect x="16" y="16" width="48" height="48" rx="6" fill="{inner_bg}" />
      <text x="40" y="45" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif" font-size="14" font-weight="bold" fill="{text_color}">{symbol}</text>
      <text x="80" y="36" font-family="-apple-system, system-ui, sans-serif" font-size="18" font-weight="bold" fill="{text_color}">{name}</text>
      <text x="80" y="58" font-family="monospace" font-size="14" fill="{desc_color}">{address}</text>
    </svg>'''
    
    with open(f'assets/{filename}', 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Successfully generated assets/{filename}")
