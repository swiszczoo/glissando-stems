import PercMainIcon from '../assets/instrument-icons/perc-main.svg';
import PercSynthIcon from '../assets/instrument-icons/perc-synth.svg';
import PercBdIcon from '../assets/instrument-icons/perc-bd.svg';
import PercSnareIcon from '../assets/instrument-icons/perc-snare.svg';
import PercHatsIcon from '../assets/instrument-icons/perc-hats.svg';
import PercAddsIcon from '../assets/instrument-icons/perc-adds.svg';
import PercSfxIcon from '../assets/instrument-icons/perc-sfx.svg';
import PercOverheadIcon from '../assets/instrument-icons/perc-overhead.svg';
import PercSampleIcon from '../assets/instrument-icons/perc-sample.svg';
import BassMainIcon from '../assets/instrument-icons/bass-main.svg';
import BassKeysIcon from '../assets/instrument-icons/bass-keys.svg';
import GuitarMainIcon from '../assets/instrument-icons/guitar-main.svg';
import GuitarLeftIcon from '../assets/instrument-icons/guitar-left.svg';
import GuitarRightIcon from '../assets/instrument-icons/guitar-right.svg';
import GuitarRhythmIcon from '../assets/instrument-icons/guitar-rhythm.svg';
import GuitarLeadIcon from '../assets/instrument-icons/guitar-lead.svg';
import KeysMainIcon from '../assets/instrument-icons/keys-main.svg';
import KeysLeadIcon from '../assets/instrument-icons/keys-lead.svg';
import KeysPadIcon from '../assets/instrument-icons/keys-pad.svg';
import KeysOrganIcon from '../assets/instrument-icons/keys-organ.svg';
import KeysDrawbarIcon from '../assets/instrument-icons/keys-drawbar.svg';
import VocalMainIcon from '../assets/instrument-icons/vocal-main.svg';
import VocalBackingIcon from '../assets/instrument-icons/vocal-backing.svg';

export enum InstrumentCategory {
  PERCUSSION,
  BASS_GUITAR,
  GUITAR,
  KEYS,
  BRASS,
  STRINGS,
  CHROMATIC_PERCUSSION,
  VOCAL,
  UNKNOWN
}

export interface InstrumentType {
  displayName: string;
  category: InstrumentCategory;
  iconSrc: string;
  orderingKey: number;
}

export const InstrumentMap: Record<string, InstrumentType> = {
  'perc-main': { 
    displayName: 'Perkusja (zestaw/mix)', 
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercMainIcon,
    orderingKey: 0
  },
  'perc-synth': {
    displayName: 'Automat perkusyjny',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercSynthIcon,
    orderingKey: 0.01,
  },
  'perc-bd': {
    displayName: 'Perkusja (stopa)',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercBdIcon,
    orderingKey: 0.1,
  },
  'perc-snare': {
    displayName: 'Perkusja (werbel)',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercSnareIcon,
    orderingKey: 0.15,
  },
  'perc-hats': {
    displayName: 'Perkusja (talerze)',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercHatsIcon,
    orderingKey: 0.2,
  },
  'perc-overhead': {
    displayName: 'Perkusja (mikrofony overhead)',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercOverheadIcon,
    orderingKey: 0.3,
  },
  'perc-sample': {
    displayName: 'Próbki (sample)',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercSampleIcon,
    orderingKey: 0.8,
  },
  'perc-sfx': {
    displayName: 'Efekty perkusyjne',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercSfxIcon,
    orderingKey: 0.97,
  },
  'perc-adds': {
    displayName: 'Perkusja (dodatki)',
    category: InstrumentCategory.PERCUSSION,
    iconSrc: PercAddsIcon,
    orderingKey: 0.98,
  },
  'bass-main': {
    displayName: 'Bas (gitara)',
    category: InstrumentCategory.BASS_GUITAR,
    iconSrc: BassMainIcon,
    orderingKey: 1,
  },
  'bass-keys': {
    displayName: 'Bas (klawisze)',
    category: InstrumentCategory.BASS_GUITAR,
    iconSrc: BassKeysIcon,
    orderingKey: 1.1,
  },
  'guitar-main': {
    displayName: 'Gitara elektryczna',
    category: InstrumentCategory.GUITAR,
    iconSrc: GuitarMainIcon,
    orderingKey: 2,
  },
  'guitar-left': {
    displayName: 'Gitara elektryczna (k. lewy)',
    category: InstrumentCategory.GUITAR,
    iconSrc: GuitarLeftIcon,
    orderingKey: 2.01,
  },
  'guitar-right': {
    displayName: 'Gitara elektryczna (k. prawy)',
    category: InstrumentCategory.GUITAR,
    iconSrc: GuitarRightIcon,
    orderingKey: 2.02,
  },
  'guitar-rhythm': {
    displayName: 'Gitara elektryczna (rytmiczna)',
    category: InstrumentCategory.GUITAR,
    iconSrc: GuitarRhythmIcon,
    orderingKey: 2.1,
  },
  'guitar-lead': {
    displayName: 'Gitara elektryczna (lead)',
    category: InstrumentCategory.GUITAR,
    iconSrc: GuitarLeadIcon,
    orderingKey: 2.2,
  },
  'keys-main': {
    displayName: 'Instrument klawiszowy',
    category: InstrumentCategory.KEYS,
    iconSrc: KeysMainIcon,
    orderingKey: 3,
  },
  'keys-lead': {
    displayName: 'Klawisze (lead)',
    category: InstrumentCategory.KEYS,
    iconSrc: KeysLeadIcon,
    orderingKey: 3.1,
  },
  'keys-pad': {
    displayName: 'Klawisze (pad)',
    category: InstrumentCategory.KEYS,
    iconSrc: KeysPadIcon,
    orderingKey: 3.2,
  },
  'keys-organ': {
    displayName: 'Organy',
    category: InstrumentCategory.KEYS,
    iconSrc: KeysOrganIcon,
    orderingKey: 3.3,
  },
  'keys-drawbar': {
    displayName: 'Organy (typ drawbar)',
    category: InstrumentCategory.KEYS,
    iconSrc: KeysDrawbarIcon,
    orderingKey: 3.31,
  },
  'vocal-main': {
    displayName: 'Wokal (główny)',
    category: InstrumentCategory.VOCAL,
    iconSrc: VocalMainIcon,
    orderingKey: 7,
  },
  'vocal-backing': {
    displayName: 'Wokal (backing)',
    category: InstrumentCategory.VOCAL,
    iconSrc: VocalBackingIcon,
    orderingKey: 7.5,
  },
  'other': {
    displayName: 'Inne',
    category: InstrumentCategory.UNKNOWN,
    iconSrc: '',
    orderingKey: Infinity,
  },
};

export const UnknownInstrument: InstrumentType = {
  displayName: 'Nieznany',
  category: InstrumentCategory.UNKNOWN,
  iconSrc: '',
  orderingKey: Infinity,
};

