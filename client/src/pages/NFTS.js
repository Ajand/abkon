import { makeStyles, Typography, Button } from "@material-ui/core";
import { Container, Row, Col } from "react-grid-system";
import NFTCard from "../components/NFTCard";

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
}));

const NFTS = () => {
  const classes = useStyles();

  return (
    <Container>
      <Row>
        <Col md={12}>
          <div className={classes.actions}>
            <Typography variant="h6">Your NFTs:</Typography>
            <Button variant="contained" color="secondary">
              MINT A FAKE APE
            </Button>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <NFTCard src="https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi" />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="requested"
            src="https://ipfs.io/ipfs/QmcJYkCKK7QPmYWjp4FD2e3Lv5WCGFuHNUByvGKBaytif4"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmYxT4LnK8sqLupjbS6eRvu1si7Ly2wFQAqFebxhWntcf6"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="dutch"
            src="https://ipfs.io/ipfs/QmSg9bPzW9anFYc3wWU5KnvymwkxQTpmqcRSfYj7UmiBa7"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default NFTS;
