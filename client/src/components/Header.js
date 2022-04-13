import {
  makeStyles,
  AppBar,
  Typography,
  Button,
  Toolbar,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {},
  title: {
    flexGrow: 1,
    color: theme.palette.secondary.main,
  },
  mr: {
    marginRight: theme.spacing(1),
  },
}));

const Header = () => {
  const classes = useStyles();

  const connected = true;

  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          ABKON
        </Typography>
        {connected ? (
          <>
            <Button
              onClick={() => navigate("/abkoin")}
              className={classes.mr}
              color="secondary"
            >
              Abkoin
            </Button>
            <Button
              onClick={() => navigate("/nfts")}
              className={classes.mr}
              color="secondary"
            >
              NFT Wallet
            </Button>
            <Button
              onClick={() => navigate("/panel")}
              className={classes.mr}
              color="secondary"
            >
              Specialist
            </Button>
            <Button onClick={() => navigate("/")} color="secondary">
              Auctions
            </Button>
          </>
        ) : (
          <>
            <Button color="secondary">Connect</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
