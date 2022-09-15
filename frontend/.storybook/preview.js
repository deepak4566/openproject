import { setCompodocJson } from "@storybook/addon-docs/angular";
import { addParameters } from '@storybook/client-api';
import { Pan } from "hammerjs";
import docJson from "../documentation.json";
setCompodocJson(docJson);

addParameters({
  viewMode: 'docs',
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: { inlineStories: true },
  options: {
    storySort: {
      method: 'alphabetical',
      order: [
        'Design System',
        'Devices and Accessibility',
        'Styles',
        [
          'Typography',
          'Colors',
          'Spacings',
          'Shadows',
        ],
        'Blocks',
		// TODO: Add manual sort order for components and patterns 
      ],
    },
  },
}
