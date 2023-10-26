import { OnboardingStep } from 'core-app/core/setup/globals/onboarding/onboarding_tour';

export function homescreenOnboardingTourSteps():OnboardingStep[] {
  return [
    {
      'next .op-app-header': I18n.t('js.onboarding.steps.welcome'),
      skipButton: { className: 'enjoyhint_btn-transparent', text: I18n.t('js.onboarding.buttons.skip') },
      nextButton: { text: I18n.t('js.onboarding.buttons.next') },
      containerClass: '-hidden-arrow',
      bottom: 7,
    },
    {
      containerClass: '-dark -hidden-arrow',
      onBeforeStart() {
        const href = window.location.href.slice(0, -1);
        window.location.href = `${href}projects/demo-project/work_packages/?start_onboarding_tour=true`;
      },
    },
  ];
}
