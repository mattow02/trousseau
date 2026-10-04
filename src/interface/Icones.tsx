import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  couleur: string;
  taille?: number;
}

function Trait({ couleur, taille = 22, children }: Props & { children: React.ReactNode }) {
  return (
    <Svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke={couleur}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export const Crayon = (p: Props) => (
  <Trait {...p}>
    <Path d="M4 20h4L19 9l-4-4L4 16z" />
  </Trait>
);

export const Plus = (p: Props) => (
  <Trait {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Trait>
);

export const Precedent = (p: Props) => (
  <Trait {...p}>
    <Path d="M15 18l-6-6 6-6" />
  </Trait>
);

export const Suivant = (p: Props) => (
  <Trait {...p}>
    <Path d="M9 18l6-6-6-6" />
  </Trait>
);

export const Recharger = (p: Props) => (
  <Trait {...p}>
    <Path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <Path d="M21 3v6h-6" />
  </Trait>
);

export const Grille = (p: Props) => (
  <Trait {...p}>
    <Rect x={4} y={4} width={7} height={7} rx={2} />
    <Rect x={13} y={4} width={7} height={7} rx={2} />
    <Rect x={4} y={13} width={7} height={7} rx={2} />
    <Rect x={13} y={13} width={7} height={7} rx={2} />
  </Trait>
);
