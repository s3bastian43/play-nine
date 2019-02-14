import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

// Sequence generator function (commonly referred to as "range", e.g. Clojure, PHP etc)
const range = (start, stop, step) =>
    Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

var possibleCombinationSum = function (arr, n) {
    if (arr.indexOf(n) >= 0) {
        return true;
    }
    if (arr[0] > n) {
        return false;
    }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length,
        combinationsCount = 1 << listSize;
    for (var i = 1; i < combinationsCount; i++) {
        var combinationSum = 0;
        for (var j = 0; j < listSize; j++) {
            if (i & (1 << j)) {
                combinationSum += arr[j];
            }
        }
        if (n === combinationSum) {
            return true;
        }
    }
    return false;
};

const Stars = props => {
    return (
        <div className="col-5">
            {range(0, props.numberOfStars, 1).map(i => (
                <i key={i} className="fa fa-star"/>
            ))}
        </div>
    );
};

const Button = props => {
    let button;
    switch (props.answerIsCorrect) {
        case true:
            button = (
                <button className="btn btn-success" onClick={props.acceptAnswer}>
                    <i className="fa fa-check"/>
                </button>
            );
            break;
        case false:
            button = (
                <button className="btn btn-danger">
                    <i className="fa fa-times"/>
                </button>
            );
            break;
        default:
            button = (
                <button
                    className="btn btn-primary"
                    onClick={props.checkAnswer}
                    disabled={props.selectedNumbers.length === 0}
                >
                    =
                </button>
            );
            break;
    }

    return (
        <div className="col-2 text-center control-container">
            {button}
            <br/>
            <button
                className="btn btn-warning btn-sm"
                onClick={props.redraw}
                disabled={props.redraws === 0}
            >
                <i className="fa fa-sync"/> {props.redraws}
            </button>
        </div>
    );
};

const Answer = props => {
    return (
        <div className="col-5">
            {props.selectedNumbers.map((number, i) => (
                <span key={i} onClick={() => props.unselectNumber(number)}>
          {number}
        </span>
            ))}
        </div>
    );
};

const Numbers = props => {
    const numberClassName = number => {
        if (props.selectedNumbers.indexOf(number) >= 0) {
            return "selected";
        }
        if (props.usedNumbers.indexOf(number) >= 0) {
            return "used";
        }
    };

    return (
        <div className="card text-center">
            <div>
                {Numbers.list.map((number, i) => (
                    <span
                        key={i}
                        className={numberClassName(number)}
                        onClick={() => props.selectNumber(number)}
                    >
            {number}
          </span>
                ))}
            </div>
        </div>
    );
};

Numbers.list = range(1, 10, 1);

const DoneFrame = props => {
    return (
        <div className="text-center">
            <h2>{props.doneStatus}</h2>
            <button className="btn btn-secondary" onClick={props.resetGame}>
                Play Again
            </button>
        </div>
    );
};

const Timer = props => {
    return (
        <div>
            <h5>You have <span className={props.secondsStatus}>{props.seconds}</span> seconds left.</h5>
        </div>
    );
};

class Game extends React.Component {
    static randomNumber = () => 1 + Math.floor(Math.random() * 9);

    static initialState = () => ({
        selectedNumbers: [],
        randomNumberOfStars: Game.randomNumber(),
        usedNumbers: [],
        answerIsCorrect: null,
        redraws: 5,
        doneStatus: null,
        seconds: 5,
        secondsStatus: ''
    });
    state = Game.initialState();

    resetGame = () => this.setState(Game.initialState());

    selectNumber = clickedNumber => {
        if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
            return;
        }
        this.setState(prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
        }));
    };

    unselectNumber = clickedNumber => {
        this.setState(prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.filter(
                number => number !== clickedNumber
            )
        }));
    };

    checkAnswer = () => {
        this.setState(prevState => ({
            answerIsCorrect:
                prevState.randomNumberOfStars ===
                prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
        }));
    };

    acceptAnswer = () => {
        this.setState(
            prevState => ({
                usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
                selectedNumbers: [],
                answerIsCorrect: null,
                randomNumberOfStars: Game.randomNumber()
            }),
            this.updateDoneStatus
        );
    };

    redraw = () => {
        if (this.state.redraws === 0) {
            return;
        }
        this.setState(
            prevState => ({
                randomNumberOfStars: Game.randomNumber(),
                selectedNumbers: [],
                answerIsCorrect: null,
                redraws: prevState.redraws - 1
            }),
            this.updateDoneStatus
        );
    };

    possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
        const possibleNumbers = range(1, 10, 1).filter(
            number => usedNumbers.indexOf(number) === -1
        );

        return possibleCombinationSum(possibleNumbers, randomNumberOfStars);
    };

    updateDoneStatus = () => {
        this.setState(prevState => {
            if (prevState.usedNumbers.length === 9) {
                return {
                    doneStatus: "Done",
                    redraws: 0
                };
            }
            if (prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
                return {
                    doneStatus: "Game Over",
                    redraws: 0
                };
            }
            if (prevState.seconds === 0) {
                return {
                    doneStatus: "Game Over",
                    redraws: 0
                };
            }
        });
    };

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        if (this.state.seconds === 0) {
            return;
        }
        this.setState(
            prevState => ({
                seconds: prevState.seconds - 1
            }),
            this.updateDoneStatus
        );
        if (this.state.seconds <= 10) {
            this.setState({
                secondsStatus: 'text-danger'
            });
        }
    }

    render() {
        const {
            selectedNumbers,
            answerIsCorrect,
            usedNumbers,
            redraws,
            doneStatus,
            seconds,
            secondsStatus
        } = this.state;

        return (
            <div className="container py-4">
                <div className="row">
                    <div className="col-12 col-md-8">
                        <h3>Play Nine</h3>
                    </div>
                    <div className="col-12 col-md-4">
                        {(seconds > 0) ?
                            (<Timer seconds={seconds} secondsStatus={secondsStatus}/>) : (<h5>Time's up!</h5>)
                        }
                    </div>
                </div>
                <hr/>
                <div className="row">
                    <Stars numberOfStars={this.state.randomNumberOfStars}/>
                    <Button
                        selectedNumbers={selectedNumbers}
                        redraws={redraws}
                        checkAnswer={this.checkAnswer}
                        answerIsCorrect={answerIsCorrect}
                        acceptAnswer={this.acceptAnswer}
                        redraw={this.redraw}
                    />
                    <Answer
                        selectedNumbers={this.state.selectedNumbers}
                        unselectNumber={this.unselectNumber}
                    />
                </div>
                <br/>
                {doneStatus ? (
                    <DoneFrame resetGame={this.resetGame} doneStatus={doneStatus}/>
                ) : (
                    <Numbers
                        selectedNumbers={this.state.selectedNumbers}
                        selectNumber={this.selectNumber}
                        acceptAnswer={this.acceptAnswer}
                        usedNumbers={usedNumbers}
                    />
                )}

                <br/>
            </div>
        );
    }
}

class App extends React.Component {

    render() {
        return (
            <Game/>
        );
    }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
