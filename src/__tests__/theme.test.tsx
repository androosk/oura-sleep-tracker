import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { darkTheme, lightTheme } from '../theme/tokens';

function BackgroundProbe() {
  const theme = useTheme();
  return <Text testID="probe">{theme.background}</Text>;
}

describe('theme tokens (US-011)', () => {
  it('defines the same token keys for both themes', () => {
    expect(Object.keys(darkTheme).sort()).toEqual(Object.keys(lightTheme).sort());
  });

  it('actually differs between dark and light', () => {
    expect(darkTheme.background).not.toBe(lightTheme.background);
  });

  it('gives every sleep stage a distinct color within the dark theme', () => {
    const stages = [
      darkTheme.stageDeep,
      darkTheme.stageRem,
      darkTheme.stageLight,
      darkTheme.stageAwake,
    ];
    expect(new Set(stages).size).toBe(4);
  });

  it('bands score colors distinctly', () => {
    const bands = [darkTheme.scoreOptimal, darkTheme.scoreGood, darkTheme.scoreAttention];
    expect(new Set(bands).size).toBe(3);
  });
});

describe('ThemeProvider (US-011: follows the system appearance)', () => {
  it('serves dark tokens under a dark scheme', () => {
    const { getByTestId } = render(
      <ThemeProvider schemeOverride="dark">
        <BackgroundProbe />
      </ThemeProvider>,
    );
    expect(getByTestId('probe').props.children).toBe(darkTheme.background);
  });

  it('serves light tokens under a light scheme', () => {
    const { getByTestId } = render(
      <ThemeProvider schemeOverride="light">
        <BackgroundProbe />
      </ThemeProvider>,
    );
    expect(getByTestId('probe').props.children).toBe(lightTheme.background);
  });
});
