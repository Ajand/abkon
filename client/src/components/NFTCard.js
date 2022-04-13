import {
  makeStyles,
  Paper,
  Divider,
  Button,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
      marginBottom: theme.spacing(2)
  },
  img: {
    width: "100%",
  },
  section: { padding: theme.spacing(2) },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: 'end'
  },
}));

const NFTCard = ({ variant, src }) => {
  const classes = useStyles();

  const renderProperActions = () => {
    switch (variant) {
      case "dutch":
        return (
          <>
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <Typography variant="body1">Dutch Auction</Typography>
                <Typography variant="body2">5:00</Typography>
              </div>
            </div>
            <Divider />
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <div className={classes.priceInfo}>
                  <Typography variant="body1" className={classes.priceTitle}>
                    Current Price:
                  </Typography>
                  <Typography variant="body2" className={classes.priceAmount}>
                    300 ABK
                  </Typography>
                </div>
                <Button size="small" variant="text" color="primary">
                  Buy
                </Button>
              </div>
            </div>
          </>
        );
      case "english":
        return (
          <>
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <Typography variant="body1">English Auction</Typography>
                <Typography variant="body2">5:00</Typography>
              </div>
            </div>
            <Divider />
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <div className={classes.priceInfo}>
                  <Typography variant="body1" className={classes.priceTitle}>
                    Highest Bid:
                  </Typography>
                  <Typography variant="body2" className={classes.priceAmount}>
                    1000 ABK
                  </Typography>
                </div>
                <Button size="small" variant="text" color="primary">
                  Bid
                </Button>
              </div>
            </div>
          </>
        );
      case "requested":
        return (
          <div className={classes.section}>
            <div className={classes.actionRow}>
              <div className={classes.priceInfo}>
                <Typography variant="body1" className={classes.priceTitle}>
                  Offered Price:
                </Typography>
                <Typography variant="body2" className={classes.priceAmount}>
                  1000 ABK
                </Typography>
              </div>
              <Button size="small" variant="text" color="primary">
                Accept
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className={classes.section}>
            <Button size="small" fullWidth variant="contained" color="primary">
              Request For Price
            </Button>
          </div>
        );
    }
  };

  return (
    <Paper className={classes.root}>
      <div>
        <img className={classes.img} src={src} />
      </div>
      <Divider />
      <div className={classes.section}>Fake Ape #5</div>
      <Divider />
      {renderProperActions()}
    </Paper>
  );
};

export default NFTCard;
