export const darkFieldSx = {
    '& .MuiInputBase-input, & .MuiInputBase-inputMultiline': { color: '#fff' },
    '& .MuiInputBase-input::placeholder, & textarea::placeholder': {
        color: '#8e8e8e',
        opacity: 1,
    },
    '& .MuiInputLabel-root': { color: '#aaa' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#0d0d0d',
        '& fieldset': { borderColor: '#444' },
        '&:hover fieldset': { borderColor: '#666' },
        '&.Mui-focused fieldset': { borderColor: '#fff' },
    },
}

export const darkSelectSx = {
    color: '#fff',
    backgroundColor: '#0d0d0d',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
    '& .MuiSvgIcon-root': { color: '#aaa' },
}

export const darkInputLabelSx = {
    color: '#aaa',
    '&.Mui-focused': { color: '#fff' },
}

export const darkMenuProps = {
    PaperProps: {
        sx: {
            bgcolor: '#121212',
            color: '#fff',
            border: '1px solid #333',
            '& .MuiMenuItem-root:hover': { bgcolor: '#202020' },
            '& .Mui-selected': { bgcolor: '#252525 !important' },
        },
    },
}

export const darkAutocompleteSlotProps = {
    paper: {
        sx: {
            bgcolor: '#121212',
            color: '#fff',
            border: '1px solid #333',
            '& .MuiAutocomplete-noOptions': { color: '#aaa' },
            '& .MuiAutocomplete-option': {
                '&:hover': { bgcolor: '#202020' },
                '&[aria-selected="true"]': { bgcolor: '#252525' },
            },
        },
    },
    chip: {
        sx: {
            bgcolor: '#242424',
            color: '#fff',
            '& .MuiChip-deleteIcon': { color: '#aaa' },
        },
    },
}

export const lightContainedButtonSx = {
    bgcolor: '#fff',
    color: '#000',
    '&:hover': { bgcolor: '#d6d6d6' },
    '&.Mui-disabled': { bgcolor: '#555', color: '#aaa' },
}

export const darkOutlinedButtonSx = {
    borderColor: '#555',
    color: '#fff',
    '&:hover': { borderColor: '#fff', bgcolor: '#1d1d1d' },
}
