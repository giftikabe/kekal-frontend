import type { RegistryEntry } from '../types/component';
import Header, { type HeaderData } from './Header/Header';
import TextBlock, { type TextBlockData } from './TextBlock/TextBlock';
import ImageDisplay, { type ImageDisplayData } from './ImageDisplay/ImageDisplay';
import Card, { type CardData } from './Card/Card';
import Form, { type FormData } from './Form/Form';
import AddToCart from './AddToCart/AddToCart';

export const componentRegistry: Record<string, RegistryEntry<unknown>> = {
  header: {
    component: Header as RegistryEntry<unknown>['component'],
    label: 'Header',
    previewProps: {
      title: 'Living, considered.',
      subtitle: 'Furniture and objects made to last, shaped by restraint.',
      backgroundImageUrl: '',
      align: 'left',
    } satisfies HeaderData,
  },

  textBlock: {
    component: TextBlock as RegistryEntry<unknown>['component'],
    label: 'Text Block',
    previewProps: {
      eyebrow: 'About',
      heading: 'Made with intent',
      html: '<p>Every Kekal piece starts with a material study, not a sketch.</p>',
      width: 'narrow',
    } satisfies TextBlockData,
  },

  imageDisplay: {
    component: ImageDisplay as RegistryEntry<unknown>['component'],
    label: 'Image',
    previewProps: {
      imageUrl: '',
      alt: 'A minimal interior with a single Kekal chair',
      caption: 'The Atlas chair, in white oak.',
      ratio: 'wide',
    } satisfies ImageDisplayData,
  },

  card: {
    component: Card as RegistryEntry<unknown>['component'],
    label: 'Card',
    previewProps: [
      { title: 'Atlas Chair', text: 'White oak, hand-finished.', priceLabel: '18,500 ETB', linkHref: '#' },
      { title: 'Ori Table', text: 'Solid walnut, seats six.', priceLabel: '42,000 ETB', linkHref: '#' },
      { title: 'Kesa Lamp', text: 'Blown glass, brushed steel.', priceLabel: '6,200 ETB', linkHref: '#' },
    ] satisfies CardData,
  },

  form: {
    component: Form as RegistryEntry<unknown>['component'],
    label: 'Form',
    previewProps: {
      heading: 'Get in touch',
      description: 'Questions about a piece, custom orders, or trade pricing.',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      submitLabel: 'Send',
    } satisfies FormData,
  },

  // FIXED: was "add_to_cart" (snake_case) — inconsistent with every other key
  // here, and would fail publish/router.ts's componentKey validation regex
  // (^[A-Za-z][A-Za-z0-9]*$, no underscores allowed) if ever republished
  // through the AI Section Flow.
  addToCart: {
    component: AddToCart as RegistryEntry<unknown>['component'],
    label: 'Add to Cart',
    previewProps: {
      custom_row_id: 'preview-row-id',
      name: 'Sample Product',
      price: { etb: 1200, usd: 22 },
      description: 'Handcrafted with care — a preview of your product.',
    },
  },
};

export type ComponentKey = keyof typeof componentRegistry;