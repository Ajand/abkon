import {
  makeStyles,
  Paper,
  Typography,
  Divider,
  Button,
  useTheme,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import ABKoin from "../web3/abis/ABKoin.json";
import { ethers } from "ethers";
import contractsAddress from "../contractsAddress";
import { SpinnerDiamond } from "spinners-react";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "center",
  },
  loadingContainer: {
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "80vh",
  },
  panel: {
    maxWidth: 400,
    width: "95%",
  },
  section: { padding: theme.spacing(2) },
  informationRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5em",
  },
}));

const ABKoinPage = ({ connection }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [totalSupply, setTotalSupply] = useState(0);
  const [yourBalance, setBalance] = useState(0);

  const abKoin = new ethers.Contract(
    contractsAddress.abkoin,
    ABKoin.abi,
    connection.signer
  );

  const mainDataFetching = async () => {
    const balance = connection.account
      ? await abKoin.balanceOf(connection.account)
      : 0;
    const totalSupply = await abKoin.totalSupply();

    setTotalSupply(String(totalSupply));
    setBalance(String(balance));
    setLoading(false);
  };

  useEffect(() => {
    mainDataFetching();
  }, [connection.account]);

  if (loading)
    return (
      <div className={classes.loadingContainer}>
        <SpinnerDiamond
          size={73}
          thickness={180}
          speed={152}
          color="rgba(77, 119, 255, 1)"
          secondaryColor="rgba(242, 250, 90, 1)"
        />
      </div>
    );

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
            <div className={classes.informationTitle}>{totalSupply}</div>
          </div>
          <div className={classes.informationRow}>
            <div className={classes.informationTitle}>Your Balance</div>
            <div className={classes.informationTitle}>{yourBalance}</div>
          </div>
        </div>

        <Divider />
        <div className={classes.section}>
          <Button
            disabled={!connection.isConnected}
            fullWidth
            variant="contained"
            color="primary"
            onClick={async () => {
              const tx = await abKoin.mint(connection.account, 1000);
              const isTransactionMined = async (transactionHash) => {
                const txReceipt =
                  await connection.provider.getTransactionReceipt(
                    transactionHash
                  );
                if (txReceipt && txReceipt.blockNumber) {
                  return txReceipt;
                }
              };

              const a = setInterval(() => {
                if (isTransactionMined(tx.hash)) {
                  setTimeout(() => {
                    mainDataFetching();
                  }, 3 * 1000);
                  clearInterval(a);
                }
              }, 2000);
            }}
          >
            MINT 1000
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default ABKoinPage;
