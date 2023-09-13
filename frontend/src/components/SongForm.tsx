import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/system';

import AddIcon from '@mui/icons-material/Add';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import Input from './Input';
import { GreenButton, RedButton } from './NavbarButton';

const FormEntryContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > *': {
    margin: `0 ${theme.spacing(1)}`
  }
}));

const FormLengthBox = styled('div')(({ theme }) => ({
  height: 40,
  width: 40,
  border: `2px solid ${theme.palette.primary.dark}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 40,
  fontSize: 20,
  flexShrink: 0,
}));

const RoundGreenButton = styled(GreenButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const RoundRedButton = styled(RedButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

interface FormEntryProps {
  nameInputRef?: React.RefObject<HTMLInputElement>;
  length?: number;
  entryCount?: number;
  initialName: string;
  initialBar: number;
  onAdd?: (name: string, bar: number) => void;
  onBlur?: (name: string, bar: number) => void;
  onDelete?: () => void;
}

const numberRegex = /^[0-9]{0,10}$/;

function FormEntry(props: FormEntryProps) {
  const [ name, setName ] = useState(props.initialName);
  const [ bar, setBar ] = useState<string | number>(props.initialBar);
  const inputRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const nameRef = props.nameInputRef || inputRef;

  useEffect(() => setName(props.initialName), [props.initialName, props.entryCount]);
  useEffect(() => setBar(props.initialBar), [props.initialBar]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value.substring(0, 100));
  };

  const handleBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length === 0) {
      setBar('');
      return;
    }

    if (numberRegex.test(event.currentTarget.value)) {
      setBar(parseInt(event.currentTarget.value));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const { currentTarget } = event;

    requestAnimationFrame(() => {
      if (name.length === 0 && !props.nameInputRef) {
        const input = nameRef.current?.firstChild as HTMLInputElement;
        input.focus();
        return;
      }

      if (typeof bar !== 'number') {
        const input = barRef.current?.firstChild as HTMLInputElement;
        input.focus();
        return;
      }

      if (!currentTarget.contains(document.activeElement)) {
        if (props.onBlur) props.onBlur(name, bar);
      }
    });
  };

  const handleAddClick = () => {
    if (props.onAdd && name.length > 0 && typeof bar === 'number') {
      props.onAdd(name, bar);
    }
  };

  const handleDeleteClick = () => {
    if (props.onDelete) {
      props.onDelete();
    }
  };

  return (
    <FormEntryContainer onBlur={handleBlur}>
      <FormLengthBox title='Długość sekcji (w taktach)'>
        { props.length === undefined && '+' }
        { props.length === 0 && '...' }
        { props.length !== undefined && props.length > 0 && props.length }
      </FormLengthBox>
      <Input ref={nameRef} style={{ flexGrow: 1 }} value={name} placeholder='Wprowadź nazwę sekcji' onChange={handleNameChange} />
      <Input ref={barRef} style={{ width: 90 }} value={bar} placeholder='Wprowadź numer taktu' onChange={handleBarChange} />
      {
        props.onAdd 
        ? <RoundGreenButton title='Dodaj' onClick={handleAddClick}><AddIcon /></RoundGreenButton>
        : <RoundRedButton disabled={props.length === undefined} title='Usuń' onClick={handleDeleteClick}><CloseRoundedIcon /></RoundRedButton>
      }
    </FormEntryContainer>
  );
}

interface SongFormProps {
  form: FormType;
  onUpdate?: (newForm: FormType) => void;
}

function SongForm(props: SongFormProps) {
  const inputNameRef = useRef<HTMLInputElement>(null);

  const handleAdd = (name: string, bar: number) => {
    const barSeen: Record<string, boolean> = {};
    const newForm = [
      ...props.form,
      { name, bar }
    ].filter((item) => Object.prototype.hasOwnProperty.call(barSeen, item.bar.toFixed()) ? false : (barSeen[item.bar.toFixed()] = true));

    newForm.sort((a, b) => a.bar - b.bar);

    if (props.onUpdate) {
      props.onUpdate(newForm);

      const input = inputNameRef.current?.firstChild as HTMLInputElement;
      input.focus();
    }
  };

  const handleUpdate = (index: number, name: string, bar: number) => {
    if (name === props.form[index].name && bar === props.form[index].bar) {
      // Nothing to be done
      return;
    }

    const barSeen: Record<string, boolean> = {};
    const newForm = [
      ...props.form.slice(0, index),
      { name, bar },
      ...props.form.slice(index + 1),
    ].filter((item) => Object.prototype.hasOwnProperty.call(barSeen, item.bar.toFixed()) ? false : (barSeen[item.bar.toFixed()] = true));

    newForm.sort((a, b) => a.bar - b.bar);

    if (props.onUpdate) {
      props.onUpdate(newForm);
    }
  };

  const handleDelete = (index: number) => {
    if (props.onUpdate) {
      props.onUpdate([
        ...props.form.slice(0, index),
        ...props.form.slice(index + 1),
      ]);
    }
  }

  return (
    <>
      { 
        props.form.map((marker, i) => {
          const length = i + 1 === props.form.length ? 0 : props.form[i + 1].bar - marker.bar;
          return (
            <FormEntry 
              length={length} 
              key={i} 
              initialName={marker.name} 
              initialBar={marker.bar} 
              onBlur={handleUpdate.bind(null, i)}
              onDelete={handleDelete.bind(null, i)} />
          );
        })
      }
      <FormEntry key='add' entryCount={props.form.length} initialName='' initialBar={1} nameInputRef={inputNameRef} onAdd={handleAdd} />
    </>
  );
}

export default SongForm;
