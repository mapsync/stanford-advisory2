import React from "react";
import { Route } from 'react-router-dom'
import CMS from "netlify-cms-app";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.css";

import PostPreview from "./cms-preview-templates/post";
import ContactPreview from "./cms-preview-templates/contact";

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("post", PostPreview);
CMS.registerPreviewTemplate("contact", ContactPreview);

const style = {
  send: {
    border: '0',
    background: 'rgb(23, 162, 184)',
    color: 'white',
    'font-weight': '500',
    height: '36px',
    'line-height': '36px',
    padding: '0 40px 0 20px',
    width: '200px',
    cursor: 'pointer'
  }
}

const account = "stanfordwater"
const channel = "stanfordwater"
const netlify = "hardcore-sammet-6f1a1f"

const encode = function (data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

var NotificationControl = class Control extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "Submit",
      disabled: false
    }
  }
  
  handleClick(history, idString) {
    var id = parseInt(idString.split("-")[2]);
    var self = this;
    self.setState({
      message: "Sending...",
      disabled: true
    });
    var link = document.getElementById("link-field-" + (id - 1)).value;
    if (link == "" || link.startsWith(`https://${account}.geosync.cloud/admin`) || link.startsWith(`https://${netlify}.netlify.app/admin`) || link.startsWith(`https://${netlify}.netlify.com/admin`)) {
      link = `https://${account}.geosync.cloud`
    }
    else if (link.startsWith(`https://${netlify}.netlify.app`) || link.startsWith(`https://${netlify}.netlify.com`)) {
      var url = new URL(link);
      link = `https://${account}.geosync.cloud` + url.pathname + url.search
    }
    else if (!link.startsWith(`https://${account}.geosync.cloud`)) {
      link = `https://${account}.geosync.cloud`
    }
    var delivery = new Date().toISOString();
    var date = new Date(document.getElementById("delivery-field-" + (id - 5)).value);
    if (date) {
      delivery = date.toISOString();
    }
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "notification",
        "account": channel,
        "title": document.getElementById("title-field-" + (id - 6)).value,
        "delivery": delivery,
        "priority": document.getElementById("priority-field-" + (id - 4)).getAttribute("aria-checked"),
        "sound": document.getElementById("sound-field-" + (id - 3)).getAttribute("aria-checked"),
        "message": document.getElementById("message-field-" + (id - 2)).value,
        "link": link
      })
    })
      .then(function () {
        self.setState({
          message: "Success!"
        });
        setTimeout(function () {
          document.getElementById("title-field-" + (id - 6)).value = "";
          history.push('/collections/notification');
        }, 3000)
      })
      .catch(function (error) {
         alert(error);
         self.setState({
          message: "Submit",
          disabled: false
        });
      });
  }

  render() {
    const {
      forID
    } = this.props;
    return (
      <div>
        <Route render={({ history}) => (
          <button style={style.send} disabled={this.state.disabled} onClick={() => { this.handleClick(history, forID); }} type="button">
          { this.state.message }
          </button>
        )} />
      </div>
    );
  }
}

CMS.registerWidget('notification', NotificationControl)
CMS.init();
