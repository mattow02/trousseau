"""Génère assets/icon.png : la plaque du site principal, en icône.

Fond bleu outremer, initiales « Tr » en Bricolage Grotesque, anneau de clé
en haut à droite. iOS arrondit lui-même les coins : on livre un carré plein.

Usage, depuis la racine du dépôt : python3 outils/icone.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RACINE = Path(__file__).resolve().parent.parent
POLICE = (
    RACINE
    / 'node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf'
)
COTE = 1024
ACCENT = '#1F3BFF'
BLANC = '#FFFFFF'


def main() -> None:
    image = Image.new('RGB', (COTE, COTE), ACCENT)
    dessin = ImageDraw.Draw(image)

    police = ImageFont.truetype(str(POLICE), 560)
    x0, _, _, y1 = dessin.textbbox((0, 0), 'Tr', font=police)
    dessin.text((150 - x0, COTE - 170 - y1), 'Tr', font=police, fill=BLANC)

    rayon, epaisseur, cx, cy = 74, 30, COTE - 220, 220
    dessin.ellipse((cx - rayon, cy - rayon, cx + rayon, cy + rayon), outline=BLANC, width=epaisseur)

    image.save(RACINE / 'assets/icon.png')


if __name__ == '__main__':
    main()
