// Copyright Code Mercenaries GmbH, www.codemercs.com
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
module.exports = function (RED) {
	'use strict';
	var JW56FR1 = require('node-hid');
	var devices = JW56FR1.devices();

	// Some defines for JW56FR1
	const vid = 0x07c0;         // Code Mercenaries Vendor ID
	const pid = 0x111a;         // JoyWarrior56FR1 Product ID

	//Byte ARng
	const JW56FR1_ARNG_RANGE_2G = 0x00;
	const JW56FR1_ARNG_RANGE_4G = 0x02;
	const JW56FR1_ARNG_RANGE_8G = 0x03;
	const JW56FR1_ARNG_RANGE_16G = 0x01;

	//BYTE AFilt
	const JW56FR1_AFILT_NONE = 0x00;
	const JW56FR1_AFILT_LP1_ONLY = 0x00;	//LP1 only
	const JW56FR1_AFILT_LP1_HP = 0x40;		//LP1 + HP
	const JW56FR1_AFILT_LP1_LP2 = 0x80;		//LP1 + LP2
	const JW56FR1_AFILT_LP1_HP_2 = 0xC0;	//LP1 + HP
	const JW56FR1_AFILT_BAND_0 = 0x00;
	const JW56FR1_AFILT_BAND_1 = 0x20;

	const JW56FR1_AFILT_BW_0 = 0x00;	//LP1+LP2 16.66Hz
	const JW56FR1_AFILT_BW_1 = 0x01;	//LP1+LP2 8.33Hz
	const JW56FR1_AFILT_BW_2 = 0x02;	//LP1+LP2 92.56Hz
	const JW56FR1_AFILT_BW_3 = 0x03;	//LP1+LP2 2.08Hz

	const JW56FR1_AFILT_BW_4 = 0x00;	//LP1+HP 208.25Hz
	const JW56FR1_AFILT_BW_5 = 0x01;	//LP1+HP 8.33Hz
	const JW56FR1_AFILT_BW_6 = 0x02;	//LP1+HP 92.56Hz
	const JW56FR1_AFILT_BW_7 = 0x03;	//LP1+HP 2.08Hz

	//Byte GRng
	const JW56FR1_GRNG_245DPS = 0x00;
	const JW56FR1_GRNG_125DPS = 0x01;
	const JW56FR1_GRNG_500DPS = 0x02;
	const JW56FR1_GRNG_1000DPS = 0x04;
	const JW56FR1_GRNG_2000DPS = 0x06;

	//Byte GFilt
	const JW56FR1_GFILT_NONE = 0x00;
	const JW56FR1_GFILT_HP_ON = 0x80;	//HP filter ON
	const JW56FR1_GFILT_HP_OFF = 0x00;	//HP filter OFF
	const JW56FR1_GFILT_BW_0 = 0x00;	//16mHz
	const JW56FR1_GFILT_BW_1 = 0x01;	//65mHz
	const JW56FR1_GFILT_BW_2 = 0x02;	//260mHz
	const JW56FR1_GFILT_BW_3 = 0x03;	//1.04Hz

	//Store param permanent
	const JW56FR1_STORE = 0x01;

	//Conversion values
	const JW56FR1_CONVERSION_ACC_2G = 0.061;
	const JW56FR1_CONVERSION_ACC_4G = 0.122;
	const JW56FR1_CONVERSION_ACC_8G = 0.244;
	const JW56FR1_CONVERSION_ACC_16G = 0.488;

	const JW56FR1_CONVERSION_GYRO_125 = 4.375;
	const JW56FR1_CONVERSION_GYRO_245 = 8.75;
	const JW56FR1_CONVERSION_GYRO_500 = 17.50;
	const JW56FR1_CONVERSION_GYRO_1000 = 35.00;
	const JW56FR1_CONVERSION_GYRO_2000 = 70.00;

	//Get device path for access
	var deviceInfo = devices.find(function (d) {
		var isJW56FR1 = d.vendorId === vid && d.productId === pid && d.interface === 0;
		return isJW56FR1;
	});

	function jw56fr1_read(n) {
		RED.nodes.createNode(this, n);
		this.acceleration = n.acceleration;
		this.rotation = n.rotation;
		this.name = n.name;
		var node = this;

		try {
			this.device = new JW56FR1.HID(deviceInfo.path);
			node.status({ fill: "green", shape: "dot", text: "Connected" });

			this.device.on('data', function (buf) {
				var msg = {};

				msg = {
					payload: {
						acceleration: {
							x: buf[0] + (256 * buf[1]),
							y: buf[2] + (256 * buf[3]),
							z: buf[4] + (256 * buf[5])
						},
						gyroscope: {
							x: buf[6] + (256 * buf[7]),
							y: buf[8] + (256 * buf[9]),
							z: buf[10] + (256 * buf[11])
						},
						buttons: buf[12]
					}
				};

				node.send(msg);
			});

			node.on('close', function () {
				node.device.close();
			});

		} catch (err) {
			console.log(error.name + ":" + error.message);
			node.error(error.name + ":" + error.message);
			node.status({ fill: "grey", shape: "dot", text: "not-available" });
		}

		return;
	}
	RED.nodes.registerType("get data", jw56fr1_read);

	function jw56fr1_read_ext(n) {
		RED.nodes.createNode(this, n);
		this.acceleration = n.acceleration;
		this.rotation = n.rotation;
		this.name = n.name;

		var node = this;

		try {
			this.device = new JW56FR1.HID(deviceInfo.path);
			node.status({ fill: "green", shape: "dot", text: "Connected" });

			var range_acc = JW56FR1_ARNG_RANGE_2G;
			var range_gyr = JW56FR1_GRNG_245DPS;

			switch (node.acceleration) {
				case "0": range_acc = 0x00; break;    //2G
				case "1": range_acc = 0x02; break;    //4G
				case "2": range_acc = 0x03; break;    //8G
				case "3": range_acc = 0x01; break;    //16G
				default: break;
			}

			switch (node.rotation) {
				case "0": range_gyr = 0x01; break;    //125dps
				case "1": range_gyr = 0x00; break;    //245dps
				case "2": range_gyr = 0x02; break;    //500dps
				case "3": range_gyr = 0x04; break;    //1000dps
				case "4": range_gyr = 0x06; break;    //2000dps
				default: break;
			}

			//Try to write new config into JW56FR1 temporary
			try {
				this.device.write([0x00, 0x00, range_acc, 0x00/*afilt*/, range_gyr, 0x00/*rfilt*/, 0x00, 0x00, 0x00]);
			} catch (error) {
				node.error("Error during write on JW56FR1");
				console.log(error.name + ":" + error.message);
			}

			this.device.on('data', function (buf) {
				var msg = {};

				msg = {
					payload: {
						acceleration: {
							x: buf[0] + (256 * buf[1]),
							y: buf[2] + (256 * buf[3]),
							z: buf[4] + (256 * buf[5])
						},
						gyroscope: {
							x: buf[6] + (256 * buf[7]),
							y: buf[8] + (256 * buf[9]),
							z: buf[10] + (256 * buf[11])
						},
						buttons: buf[12]
					}
				};

				node.send(msg);
			});

			node.on('close', function () {
				node.device.close();
			});

		} catch (err) {
			console.log(error.name + ":" + error.message);
			node.error(error.name + ":" + error.message);
			node.status({ fill: "grey", shape: "dot", text: "not-available" });
		}

		return;
	}
	RED.nodes.registerType("get data ext", jw56fr1_read_ext);

	function jw56fr1_config(n) {
		RED.nodes.createNode(this, n);
		this.name = n.name;
		this.store = n.store;
		this.acceleration = n.acceleration;
		this.rotation = n.rotation;
		this.afilt1 = n.afilt1;
		this.afilt2 = n.afilt2;
		this.afilt3 = n.afilt3;
		this.rfilt1 = n.rfilt1;
		this.rfilt2 = n.rfilt2;

		var node = this;

		node.on("input", function (msg) {

			try {
				this.device = new JW56FR1.HID(deviceInfo.path);
				node.status({ fill: "green", shape: "dot", text: "Connected" });

				var range_acc = JW56FR1_ARNG_RANGE_2G;
				var range_gyr = JW56FR1_GRNG_245DPS;
				var afilt = JW56FR1_AFILT_NONE;
				var rfilt = JW56FR1_GFILT_NONE;

				//Settings for ACCELERATION
				switch (node.acceleration) {
					case "0": range_acc = JW56FR1_ARNG_RANGE_2G; break;    //2G
					case "1": range_acc = JW56FR1_ARNG_RANGE_4G; break;    //4G
					case "2": range_acc = JW56FR1_ARNG_RANGE_8G; break;    //8G
					case "3": range_acc = JW56FR1_ARNG_RANGE_16G; break;    //16G
					default: break;
				}

				switch (node.afilt1) {
					case "0": afilt |= JW56FR1_AFILT_LP1_ONLY; break;
					case "1": afilt |= JW56FR1_AFILT_LP1_HP; break;
					case "2": afilt |= JW56FR1_AFILT_LP1_LP2; break;
					case "3": afilt |= JW56FR1_AFILT_LP1_HP_2; break;
					default: break;
				}

				switch (node.afilt2) {
					case "0": afilt |= JW56FR1_AFILT_BAND_0; break;
					case "1": afilt |= JW56FR1_AFILT_BAND_1; break;
					default: break;
				}

				switch (node.afilt3) {
					case "0": afilt |= JW56FR1_AFILT_BW_0; break;
					case "1": afilt |= JW56FR1_AFILT_BW_1; break;
					case "2": afilt |= JW56FR1_AFILT_BW_2; break;
					case "3": afilt |= JW56FR1_AFILT_BW_3; break;
					case "4": afilt |= JW56FR1_AFILT_BW_4; break;
					case "5": afilt |= JW56FR1_AFILT_BW_5; break;
					case "6": afilt |= JW56FR1_AFILT_BW_6; break;
					case "7": afilt |= JW56FR1_AFILT_BW_7; break;
					default: break;
				}

				//Settings for GYRO
				switch (node.rotation) {
					case "0": range_gyr = JW56FR1_GRNG_125DPS; break;    //125dps
					case "1": range_gyr = JW56FR1_GRNG_245DPS; break;    //245dps
					case "2": range_gyr = JW56FR1_GRNG_500DPS; break;    //500dps
					case "3": range_gyr = JW56FR1_GRNG_1000DPS; break;    //1000dps
					case "4": range_gyr = JW56FR1_GRNG_2000DPS; break;    //2000dps
					default: break;
				}

				switch (node.rfilt1) {
					case "0": rfilt |= JW56FR1_GFILT_HP_OFF; break;
					case "1": rfilt |= JW56FR1_GFILT_HP_ON; break;
					default: break;
				}

				switch (node.rfilt2) {
					case "0": rfilt |= JW56FR1_GFILT_BW_0; break;
					case "1": rfilt |= JW56FR1_GFILT_BW_1; break;
					case "2": rfilt |= JW56FR1_GFILT_BW_2; break;
					case "3": rfilt |= JW56FR1_GFILT_BW_3; break;
					default: break;
				}

				//Try to write new config into JW56FR1
				try {
					this.device.write([0x00, 0x00, range_acc, afilt, range_gyr, rfilt, 0x00, 0x00, 0x00]);
				} catch (error) {
					node.error("Error during write on JW56FR1");
					console.log(error.name + ":" + error.message);
				}

				//Store config permanent into EEPROM/Flash
				if (node.store == "1") {
					try {
						this.device.write([0x00, JW56FR1_STORE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

					} catch (error) {
						node.error("Error during write on JW56FR1");
						console.log(error.name + ":" + error.message);
					}
				}
			}
			catch (error) {
				console.log(error.name + ":" + error.message);
				node.error(error.name + ":" + error.message);
				node.status({ fill: "grey", shape: "dot", text: "not-available" });
			}
		});

		node.on('close', function () {
			node.device.close();
		});

		return;
	}
	RED.nodes.registerType("set config", jw56fr1_config);


	//Convert RAW data into miliG +/-
	function jw56fr1_convert(n) {
		RED.nodes.createNode(this, n);
		this.name = n.name;
		this.acceleration = n.acceleration;
		this.rotation = n.rotation;

		var node = this;
		var acc_convert = 0;
		var gyr_convert = 0;
		var mid = 0x7FFF;

		//Settings for ACCELERATION
		switch (node.acceleration) {
			case "0": acc_convert = JW56FR1_CONVERSION_ACC_2G; break;    //2G
			case "1": acc_convert = JW56FR1_CONVERSION_ACC_4G; break;    //4G
			case "2": acc_convert = JW56FR1_CONVERSION_ACC_8G; break;    //8G
			case "3": acc_convert = JW56FR1_CONVERSION_ACC_16G; break;    //16G
			default: break;
		}

		//Settings for GYRO
		switch (node.rotation) {
			case "0": gyr_convert = JW56FR1_CONVERSION_GYRO_125; break;    //125dps
			case "1": gyr_convert = JW56FR1_CONVERSION_GYRO_245; break;    //245dps
			case "2": gyr_convert = JW56FR1_CONVERSION_GYRO_500; break;    //500dps
			case "3": gyr_convert = JW56FR1_CONVERSION_GYRO_1000; break;    //1000dps
			case "4": gyr_convert = JW56FR1_CONVERSION_GYRO_2000; break;    //2000dps
			default: break;
		}

		this.on('input', function (msg, send, done) {
			var accX = (parseInt(msg.payload["acceleration"]["x"]) - mid) * acc_convert;
			var accY = (parseInt(msg.payload["acceleration"]["y"]) - mid) * acc_convert;
			var accZ = (parseInt(msg.payload["acceleration"]["z"]) - mid) * acc_convert;

			msg.payload["acceleration"]["x"] = accX.toFixed(3);
			msg.payload["acceleration"]["y"] = accY.toFixed(3);
			msg.payload["acceleration"]["z"] = accZ.toFixed(3);

			var gyrX = (parseInt(msg.payload["gyroscope"]["x"]) - mid) * gyr_convert;
			var gyrY = (parseInt(msg.payload["gyroscope"]["y"]) - mid) * gyr_convert;
			var gyrZ = (parseInt(msg.payload["gyroscope"]["z"]) - mid) * gyr_convert;

			msg.payload["gyroscope"]["x"] = gyrX.toFixed(3);
			msg.payload["gyroscope"]["y"] = gyrY.toFixed(3);
			msg.payload["gyroscope"]["z"] = gyrZ.toFixed(3);

			node.send(msg);

			if (done) {
				done();
			}
		});

		node.on('close', function () {
			node.device.close();
		});

		return;
	}
	RED.nodes.registerType("convert data", jw56fr1_convert);
}
