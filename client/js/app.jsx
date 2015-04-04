require("babel/register");
let React = require('react/addons');
let io = require('socket.io-client');
let update = React.addons.update;
let $ = require('jquery');
let moment = require('moment');

// API stuff
var socket = io();

class Image extends React.Component {
	constructor(props) {
		super(props);
	}

  componentDidMount() {
    //update the time ago estimates every 60 seconds
    setInterval(function() {
      this.forceUpdate();
      console.log('re-rendering image');
    }, 15*1000)
  }

	render() {
    let m = moment(this.props.doc.timestamp);
    let timeago = m.isBefore() ? m.fromNow() : "just now"; //don't show time diffs in the future
		return (
			<div className="component-image">
				<img src={this.props.doc.url} />
				<p>Submitted by {this.props.doc.submitter} {timeago}</p>
			</div>
		)
	}
}

class App extends React.Component {

  constructor(props) {
  	this.state= {images: []};
    super(props);
  }

  componentDidMount() {
  	$.getJSON('/images', function(images) {
  		this.setState({images: update(this.state.images, {$push: images})})
  	}.bind(this))

  	socket.on('connect', function(){
  		console.log('connected');
  	}.bind(this));

  	socket.on('image', function(json){
  		var i = JSON.parse(json);
  		this.setState({images: update(this.state.images, {$unshift: [i]})});
  	}.bind(this));
  }

  render() {
  	return (
  		<div>
  			{this.state.images.map((i)=> <Image doc={i} />)}
  		</div>
  	)
  }
}


React.render(<App />, document.getElementById('react'));
