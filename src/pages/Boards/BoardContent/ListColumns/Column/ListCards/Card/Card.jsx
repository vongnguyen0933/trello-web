import AttachmentIcon from '@mui/icons-material/Attachment'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'


function TrelloCard({ temporaryHideMedia }) {
  if (temporaryHideMedia) {
    return (
      <Card sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
        overflow: 'unset'

      }} >

        <CardContent sx={{ p: 1.5, '&: last-child': { p: 1.5 } }}>
          <Typography >Card test 01</Typography>
        </CardContent>

      </Card>
    )
  }
  return (
    <Card sx={{
      cursor: 'pointer',
      boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
      overflow: 'unset'

    }} >
      <CardMedia
        sx={{ height: 140 }}
        image="https://d94thh4m1x8qv.cloudfront.net/eyJidWNrZXQiOiJkaXktbWFnYXppbmUiLCJrZXkiOiJkL2RpeS9BcnRpc3RzL1QvVHlsZXItVGhlLUNyZWF0b3IvdHlsZXItcHJlc3MtMjAxNC5qcGciLCJlZGl0cyI6eyJqcGVnIjp7InF1YWxpdHkiOjEwMCwicHJvZ3Jlc3NpdmUiOnRydWUsInRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pemVTY2FucyI6dHJ1ZX0sInJlc2l6ZSI6eyJ3aWR0aCI6MTUwMCwiaGVpZ2h0IjoxMDAwLCJmaXQiOiJjb3ZlciJ9LCJzaGFycGVuIjp0cnVlfX0="
        title="green iguana"
      />
      <CardContent sx={{ p: 1.5, '&: last-child': { p: 1.5 } }}>
        <Typography >VONGNGUYEN DEV</Typography>
      </CardContent>
      <CardActions sx={{ p: '0 4px 8px 4px' }}>
        <Button size="small" startIcon={<GroupIcon />}>20</Button>
        <Button size="small" startIcon={<CommentIcon />}>15</Button>
        <Button size="small" startIcon={<AttachmentIcon />}>10</Button>
      </CardActions>
    </Card>
  )
}

export default TrelloCard