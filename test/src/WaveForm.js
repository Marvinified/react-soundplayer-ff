import React, { Component, Fragment } from 'react';
import { Progress } from 'react-soundplayer/components';
import axios from 'axios';
import './styles.css';


const NUMBER_OF_BUCKETS = 150; // number of "bars" the waveform should have
const SPACE_BETWEEN_BARS = 0.2; // from 0 (no gaps between bars) to 1 (only gaps - bars won't be visible)

class WaveForm extends Component {
    state = {
        buckets: []
    }

    constructor(props) {
        super(props);
    }
    componentDidMount() {

        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        axios({ url: this.props.audio, responseType: "arraybuffer" }).then(response => {
            let audioData = response.data;
            audioCtx.decodeAudioData(audioData, buffer => {
                let decodedAudioData = buffer.getChannelData(0);
                let bucketDataSize = Math.floor(decodedAudioData.length / NUMBER_OF_BUCKETS);
                let buckets = [];
                for (var i = 0; i < NUMBER_OF_BUCKETS; i++) {
                    let startingPoint = i * bucketDataSize;
                    let endingPoint = i * bucketDataSize + bucketDataSize;
                    let max = 0;
                    for (var j = startingPoint; j < endingPoint; j++) {
                        if (decodedAudioData[j] > max) {
                            max = decodedAudioData[j];
                        }
                    }
                    let size = Math.abs(max);
                    buckets.push(size);
                }
                this.setState({ buckets });
            }, e => {
                // callback for any errors with decoding audio data
                console.log('Error with decoding audio data' + e.err);
            });
        }).catch(err => {
            console.log(err);
        });
    }
    render() {
        const { currentTime, duration } = this.props;
        return (
            <div className="waveform-wrapper">
                <Progress
                    style={{ height: 50 }}
                    className={`progress-alter ${this.props.className}`}
                    innerClassName={this.props.innerClassName}
                    value={this.props.value}
                    onSeekTrack={this.props.onSeekTrack}
                />
                {/* <audio id="audio-element" src={this.props.audio} controls="controls" /> */}
                <svg viewBox="0 0 100 100" className="waveform-container" preserveaspectratio="xMidYMid meet">
                    <rect id="waveform-bg" className="waveform-bg" x="0" y="0" height="100" width="100" />
                    <rect id="waveform-progress" className="waveform-progress" x="0" y="0" height="100" width={currentTime / duration * 100} />
                    <circle className="slider-circle" cx={currentTime / duration * 100} cy="50" r="1.5" fill="black" fillOpacity=".2" />
                    <circle className="slider-circle" cx={currentTime / duration * 100} cy="50" r="0.5" fill="red" />
                    <rect
                        x={0}
                        y={49.75}
                        width={100}
                        height={.5}
                        fill="url(#grad1)"
                        fillOpacity=".5"
                    />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" id="stop-1" />
                            <stop offset="100%" id="stop-2" />
                        </linearGradient>
                        <clipPath id="waveform-mask">
                            {
                                this.state.buckets.map((bucket, i) => {
                                    let bucketSVGWidth = 100 / this.state.buckets.length;
                                    let bucketSVGHeight = bucket * 10;
                                    return (
                                        <rect
                                            x={bucketSVGWidth * i + SPACE_BETWEEN_BARS / 2.0}
                                            y={(100 - bucketSVGHeight) / 2.0}
                                            width={bucketSVGWidth - SPACE_BETWEEN_BARS}
                                            height={bucketSVGHeight}
                                        />
                                    );
                                })
                            }
                        </clipPath>
                    </defs>
                </svg>

            </div>
        );
    }
}

export default WaveForm;