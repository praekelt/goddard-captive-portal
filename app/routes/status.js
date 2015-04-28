
var status = {
  node: {
    cpus: 4,
    load: "0 0.01 0.03",
    uptime: 3818.590008299,
    memory: {
      total: 8245186560,
      free: 7940018176
    },
    disk: {
      total: 103380,
      free: 102170,
      raid: [
        "ACTIVE",
        "ACTIVE"
      ]
    }
  },
  wireless: {},
  router: {},
  relays: [],
  bgan: {
    faults: 0,
    lat: "-33.92510",
    lng: "18.44883",
    status: "allowed",
    ethernet: true,
    usb: true,
    signal: 63,
    temp: 29,
    imsi: "901112112609380",
    imei: "353938-03-011728-1",
    ip: "192.168.128.100",
    satellite_id: 6
  },
  nodeid: "1",
  timestamp: 1430217361350
};

var node = {
  name: null,
  serial: "00002",
  port: {
    tunnel: 15001,
    monitor: 15002
  },
  uid: 2,
  server: "goddard.io.co.za",
  publickey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDaldXUZ4h7HiJWb/9YDzb93Soj4TFkEYj/B8W8DFkbS6Db3Uenji3N4VRypLecuW1whU5eZjEWP4GGLNPwwfimstB/6QEhQjcCtqfPHoVo4upME5cLcKZendWeezJnw1kUwDacrSOTiooAKjdxuz8bLnrHvjkMuDr3r1AYuc8IdUTDf8WyJKTqptq7sG4s/bzXfYMztWTA0dkBxZcpiVz9cCxOMrfOxwby4apJBwa4Zau8iMTwxHmGYE4TMp/jMamgSCLWH4uWxUjTdPjg0szH8Y29QT6vpcu2IbKAOy/h/OSjDq066USo/Y0WP1mUoLll4JZXyZXsSAhXxH+ELbUP goddard-hub\n"
};

module.exports = function(app) {
  app.get(
    process.env.NODE_STATUS_ROUTE || '/status',
    function(req, res) {

      status.node.disk.raid_healthy = true;

      var raids = status.node.disk.raid;

      for (var raid in raids) {
        if (raids[raid] !== 'ACTIVE') {
          status.node.disk.raid_healthy = false;
        }
      }

      res.render('status', {status: status, node: node});

    }
  );
};
