import { fireEvent, render, screen } from '@testing-library/react';
import TranslationTable from './TranslationTable';

describe('Admin translation table', () => {
  test('prevents duplicate language translations', async () => {
    const onCreate = jest.fn();
    render(
      <TranslationTable
        translations={[{ id: 1, language: 'en', text: 'Hello' }]}
        onCreate={onCreate}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        isSubmitting={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Translation text'), { target: { value: 'Hi again' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Each concept can only have one translation per language.')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
