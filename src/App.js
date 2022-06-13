import { useState, useEffect } from "react";
import "./App.css";
import web3 from "./web3";
import lottery from "./lottery";
const App = () => {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState("");
  const [balance, setBalance] = useState("0");
  const [value, setValue] = useState("0.011");
  const [status, setStatus] = useState();
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    getManager();
    getPlayers();
    getBalance();
  }, [balance]);

  const getManager = async () => {
    const manager = await lottery.methods.manager().call();
    console.log(`Value of manager is ${manager}`);
    setManager(manager);
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] === manager) {
      setIsManager(true);
    }
  };
  const getPlayers = async () => {
    const players = await lottery.methods.getPlayers().call();
    setPlayers(players);
  };
  const getBalance = async () => {
    const balance = await web3.eth.getBalance(lottery.options.address);
    setBalance(balance);
  };
  const inputHandler = event => {
    setValue(event.target.value);
    console.log(value);
  };
  const submitHandler = async event => {
    event.preventDefault();
    try {
      setStatus("Waiting on transaction success......");
      const accounts = await web3.eth.getAccounts();
      const result = await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, "ether")
      });
      setStatus(
        "Transaction Successful! Your entry has been accepted. Good Luck!"
      );
      getBalance();
    } catch (err) {
      console.log(err);
      setStatus(err);
    }
  };

  const pickWinner = async () => {
    try {
      setStatus("Waiting for the transaction to be mined...");
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.pickWinner().send({
        from: accounts[0]
      });
      setStatus("Mining Complete. Transaction successful. Lottery Winner has been picked!");
      getBalance();
    } catch (err) {
      console.log(err);
      setStatus("Something went wrong.... please try again!");
    }
  };
  return (
    <div className="App">
      <h2>Web 3.0</h2>
      <h3>This contract is managed by Manager# {manager} </h3>
      <br></br>
      <i>
        Current there are <b>{players.length}</b> players in lottery and current
        balance is <b>{web3.utils.fromWei(balance, "ether")} ether</b>
      </i>
      <hr></hr>
      <form onSubmit={submitHandler}>
        <h4>Want to try your luck?</h4>
        <label>
          Enter the amount in ether <i>(Minimum amount 0.011 ether)</i>{" "}
        </label>
        <input value={value} onChange={inputHandler}></input>
        <br />
        <br />
        <button>Enter</button>
      </form>
      <hr></hr>
      {status}

      <hr />
      {isManager && <button onClick={pickWinner}>Pick Winner</button>}
    </div>
  );
};

export default App;
