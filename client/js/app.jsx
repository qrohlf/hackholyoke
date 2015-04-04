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

	render() {
    let m = moment(this.props.doc.timestamp);
    let timeago = m.isBefore(this.props.time) ? m.from(this.props.time) : "just now"; //don't show time diffs in the future
		return (
			<div className="component-image" style={{background: this.props.doc.color}}>
				<img src={this.props.doc.url} />
        <p>{timeago}</p>
			</div>
		)
	}
}

class App extends React.Component {

  constructor(props) {
  	this.state= {images: [], time: moment()};
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

    //update the time ago estimates every 60 seconds
    setInterval(function() {
      this.setState({time: moment()});
      console.log('updating times');
    }.bind(this), 15*1000)
  }

  render() {
  	return (
  		<div>
  			{this.state.images.map((i)=> <Image doc={i} time={this.state.time}/>)}
  		</div>
  	)
  }
}


React.render(<App />, document.getElementById('react'));
