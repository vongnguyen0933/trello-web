/* eslint-disable react/jsx-no-target-blank */
import { useColorScheme } from '@mui/material/styles'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'


import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'


import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'


function ModeSelect() {
  const { mode, setMode } = useColorScheme()


  const handleChange = (event) => {
    const setModeSelect = event.target.value
    setMode(setModeSelect)
  }

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl >
        <InputLabel id="label-select-dark-light-mode">Mode</InputLabel>
        <Select
          labelId="label-select-dark-light-mode"
          id="demo-simple-select"
          value={mode}
          label="Mode"
          onChange={handleChange}
        >
          <MenuItem value="light">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <LightModeIcon /> Light
            </div>
          </MenuItem>
          <MenuItem value="dark">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DarkModeIcon /> Dark
            </div>
          </MenuItem>
          <MenuItem value="system">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SettingsBrightnessIcon /> System
            </div>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}
function ModeToggle() {
  const { mode, setMode } = useColorScheme()
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
      <ModeSelect />
      <hr />
      <ModeToggle />
      <hr />
      <div>vongnguyendev</div>
      <Typography variant='body2' color='text.secondary' >Text</Typography>
      <Button variant="contained">Hello world</Button>
    </>
  )
}

export default App
