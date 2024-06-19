import { TooltipProvider } from '@radix-ui/react-tooltip';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import EditableField from '@/components/EditableField';

const onChange = vi.fn();

describe('EditableField', () => {
  afterEach(() => {
    onChange.mockClear();
  });

  test('it enters edit mode on button click', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    expect(inputField).toBeInTheDocument();
  });

  test('it updates the value and calls onChange', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'Updated Value{enter}');

    expect(onChange).toHaveBeenCalledWith('Updated Value');
  });

  test('it shows error for invalid value', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' minLength={5} />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'abc{enter}');

    expect(
      screen.getByText('Value must be at least 5 characters long')
    ).toBeInTheDocument();
  });

  test('it shows confirmation dialog', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' confirmation />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'New Value{enter}');

    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
  });

  test('it handles dialog actions correctly', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' confirmation />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'New Value{enter}');

    const continueButton = screen.getByText('Continue');
    await userEvent.click(continueButton);

    expect(onChange).toHaveBeenCalledWith('New Value');
  });

  test('it cancels edit mode on blur', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');

    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');

    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'New Value');

    await act(async () => {
      await inputField.blur();
    });

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('it cancels edit mode on Escape key press', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'New Value');

    await act(async () => {
      await userEvent.keyboard('{Escape}');
    });

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('it edits a textarea correctly', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' type='textarea' />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const textareaField = screen.getByRole('textbox');
    await userEvent.clear(textareaField);
    await userEvent.type(textareaField, 'Updated Text{enter}');

    expect(onChange).toHaveBeenCalledWith('Updated Text');
  });

  test('it handles empty value when required', async () => {
    render(
      <TooltipProvider>
        <EditableField
          onChange={onChange}
          value='Test'
          minLength={5}
          required
        />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, '{enter}');

    expect(screen.getByText('Value cannot be empty')).toBeInTheDocument();
  });

  test('it cancels changes when confirmation is not accepted', async () => {
    render(
      <TooltipProvider>
        <EditableField onChange={onChange} value='Test' confirmation />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'New Value{enter}');

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
