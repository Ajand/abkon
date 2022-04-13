import {
  makeStyles,
  Paper,
  Typography,
  Divider,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "center",
  },
  panel: {
    maxWidth: 400,
    width: "95%",
  },
  section: { padding: theme.spacing(2) },
  informationRow: {
      display: 'flex',
      justifyContent: "space-between",
      marginBottom: '0.5em'
  }
}));

const ABKoin = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper square elevation={0} className={classes.panel}>
        <div className={classes.section}>
          <Typography variant="h6">ABKoin Panel</Typography>
        </div>
        <Divider />
        <div className={classes.section}>
          <Typography variant="body1">
            Here you can see the main information about test ABKoins or mint
            some for your own good.
          </Typography>
        </div>
        <Divider />
        <div className={classes.section}>
          <div className={classes.informationRow}>
            <div className={classes.informationTitle}>Total Supply</div>
            <div className={classes.informationTitle}>1500000</div>
          </div>
          <div className={classes.informationRow}>
            <div className={classes.informationTitle}>Your Balance</div>
            <div className={classes.informationTitle}>30000</div>
          </div>
        </div>

        <Divider />
        <div className={classes.section}>
          <Button fullWidth variant="contained" color="primary">
            MINT 1000
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default ABKoin;
