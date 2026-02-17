import { render } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  it('should render the application shell', async () => {
    const { container } = await render(App);
    expect(container).toBeTruthy();
  });
});
