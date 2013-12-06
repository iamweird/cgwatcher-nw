(function() {

  var send_command = function(conn, command, param) {
    var message = {
      'command': command
    };
    if (typeof param != 'undefined') {
      message.parameter = param;
    }
    conn.write(JSON.stringify(message));
  }

  var apply_template = function(id, values) {
    var elem = document.getElementById(id);
    var template = elem.getAttribute('data-template');
    elem.innerHTML = Mark.up(template, values);
  }

  var config = {
    host: '192.168.1.110',
    port: 4028
  };
  var net = require('net');
  var client = null;

  window.setInterval(function() {
    client = net.connect(config, function() {
      send_command(client, 'gpu', 0);
    });
    client.on('data', function(data) {
      var reply = data.toString().replace(/\0/, '');
      try {
        reply = JSON.parse(reply);

        var temp = reply['GPU'][0]['Temperature'];
        apply_template('temp-value', {
          'temp': temp
        });

        var fan_speed = reply['GPU'][0]['Fan Speed'];
        var fan_percent = reply['GPU'][0]['Fan Percent'];
        apply_template('fan-value', {
          'fan': {
            'speed': fan_speed,
            'percent': fan_percent
          }
        });

        var speed = reply['GPU'][0]['MHS 5s'] * 1000;
        apply_template('speed-value', {
          'speed': speed
        });
      }
      catch (e) {
        console.log(e);
      }
      client.end();
    });
  }, 2000);

})();
