/* eslint-disable react/jsx-no-target-blank */
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import {
  useColorScheme
} from '@mui/material/styles';


function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light')
      }}
    >
      {mode === 'light' ? 'Turn dark' : 'Turn light'}
    </Button>
  )
}


function App() {

  return (
    <>
      <ModeToggle />
      <hr />
      <div>vongnguyendev</div>
      <Typography variant='body2' color='text.secondary' >Text</Typography>
      <Button variant="contained">Hello world</Button>
    </>
  )
}

export default App
