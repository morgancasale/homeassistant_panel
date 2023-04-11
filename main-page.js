import {
    LitElement,
    html,
    css
} from "https://cdn.skypack.dev/lit-element@2.4.0/lit-element.js";

//import { unsafeHTML } from 'https://cdn.skypack.dev/lit@2.4.0/directives/unsafe-html.js';
import "https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js";

import "./socket-settings.js";
import "./house-settings.js"

class MainPage extends LitElement {
    static get properties() {
        return {
            hass: { type: Object, attribute: false },
            narrow: { type: Boolean },
            route: { type: Object },
            panel: { type: Object },
            devicesData: { type: Object },
            houseData: { type: Object },
            loadSocketSettings: { type: Boolean }
        };
    }
    
    constructor(){
        super();
        this.devicesData = {};
        this.houseData = {};
        this.errState = false;
    }

    async hide_settings(){
        this.fetchData();
        this.shadowRoot.getElementById("container").style.justifyContent = "";
        
        var house_el = this.shadowRoot.getElementById("house-settings");
        if(house_el != null){
            house_el.style.display = "none";
        }
        var socket_el = this.shadowRoot.getElementById("socket-settings");
        if(socket_el != null){
            socket_el.style.display = "none";
        }

        this.shadowRoot.getElementById("btn_cont").style.display = "none";

        this.shadowRoot.getElementById("main-page").style.display = "flex";

        this.loadSocketSettings = false;
        this.loadHouseSettings = false;

        this.shadowRoot.getElementById("gen_settings_button").style.display = "block";

        if(socket_el != null){ this.resetDelState(); }
        this.resetSavedState();

        this.reRender();
        await this.requestUpdate();
    }

    async reRender(){
        await this.render();
        await new Promise(r => setTimeout(r, 1));
    }

    getSocketData(socket_name){
        return this.devicesData.find(el => el["deviceName"] == socket_name);
    }

    async show_socket_settings(socket) {
        this.socketData = this.getSocketData(socket);
        this.extDeviceData = this.socketData;
        this.loadSocketSettings = true;
        await this.reRender();

        this.shadowRoot.getElementById("socket-settings").setData(this.socketData);
        this.shadowRoot.getElementById("main-page").style.display = "none";
        this.shadowRoot.getElementById("gen_settings_button").style.display = "none";

        this.shadowRoot.getElementById("container").style.justifyContent = "center";
        this.shadowRoot.getElementById("socket-settings").style.display = "flex";
        this.shadowRoot.getElementById("btn_cont").style.display = "flex";
    }

    async show_house_settings(){
        this.loadHouseSettings = true;
        await this.requestUpdate();

        //this.shadowRoot.getElementById("house-settings").setData(this.houseData);
        this.shadowRoot.getElementById("main-page").style.display = "none";
        this.shadowRoot.getElementById("gen_settings_button").style.display = "none";

        this.shadowRoot.getElementById("container").style.justifyContent = "center";
        this.shadowRoot.getElementById("house-settings").style.display = "flex";
        this.shadowRoot.getElementById("btn_cont").style.display = "flex";
    }

    setMobileTheme() {
        var window = this.shadowRoot;
        if (window.innerWidth < 584) {
            this.style.setProperty("--pd-top", "0px");
            this.style.setProperty("--border-radius", "0px");
            this.style.setProperty("--border-width", "0px");
            this.container_width = "100%";
        } else {
            this.style.setProperty("--body-pd-top", "56px");
            this.style.setProperty("--border-radius", "");
            this.style.setProperty("--border-width", "");
        }
    }

    async loadHACards() {
        const helpers = await window.loadCardHelpers();
        helpers.createRowElement({ type: "input-datetime-entity" });
        helpers.createRowElement({ type: "input-button-entity" });
        helpers.importMoreInfoControl("light");

        //this.shadowRoot.getElementById("socket-settings").setData();
    }

    errorHandler(ev){
        ev.preventDefault();
        this.errState = ev.detail.message;
    }

    SavedState(success){
        if(success){
            var tick = this.shadowRoot.getElementById("okTick");
            tick.style.display = "block";
            tick.icon = "mdi:check";
            tick.style.color = "";

            var text = this.shadowRoot.getElementById("save_btn_text");
            text.innerText = "Saved";
            text.style.color = "";
        } else {
            var tick = this.shadowRoot.getElementById("okTick");
            tick.style.display = "block";
            tick.icon = "mdi:window-close";
            tick.style.color = "red";

            var text = this.shadowRoot.getElementById("save_btn_text");
            text.style.color = "red";
            text.innerText = "Error";
        }
    }

    resetDelState(){
        var settings = this.shadowRoot.getElementById("socket-settings");
        [0, 1, 2].map((i) =>{
            var scheduling = settings.shadowRoot.getElementById("sched" + (i+1).toString());
            ["OFF", "ON"].map((mode) =>{
                var scheduler = scheduling.shadowRoot.getElementById("sch_"+mode+"_card");
                scheduler.resetDelState();
            });
        });
    }

    resetSavedState(){
        var tick = this.shadowRoot.getElementById("okTick");
        tick.style.display = "none";
        tick.icon = "mdi:check";
        tick.style.color = "";

        var text = this.shadowRoot.getElementById("save_btn_text");
        text.innerText = "Save";
        text.style.color = "";
    }

    save_socket_settings(){
        this.socketData = this.shadowRoot.getElementById("socket-settings").save();
        this.socketData.deviceID = this.extDeviceData.deviceID;

        var cond = (this.socketData.deviceName != this.extDeviceData.deviceName) | (this.socketData.deviceName == null);
        this.socketData.deviceName = (cond) ? this.socketData.deviceName : this.extDeviceData.deviceName;

        var url = "http://192.168.2.145:8099/setDeviceSettings";
        var request = {
            method: "PUT", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }, // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify([this.socketData])
        };
        
        if(!this.errState){
            fetch(url, request)
            .then((response) => {
                this.SavedState(response.ok);
            })
            .catch(error => {
                throw new Error("An error occured while performing PUT request: \n\t" + error.message);
            });
        }
    }

    save_house_settings(){
        var newHouseData = this.shadowRoot.getElementById("house-settings").save();
        Object.assign(newHouseData, { houseID : this.houseData.houseID })

        var url = "http://192.168.2.145:8099/setHouseSettings";
        var request = {
            method: "PUT", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }, // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify([newHouseData])
        };
        
        if(!this.errState){
            fetch(url, request)
            .then((response) => {
                this.SavedState(response.ok);
            })
            .catch(error => {
                throw new Error("An error occured while performing PUT request: \n\t" + error.message);
            });
        }
    }

    save(){
        try{
            if(this.loadHouseSettings){
                this.save_house_settings();
            } else if(this.loadSocketSettings){
                this.save_socket_settings();
            }
        } catch(e){
            alert("An error occured while saving settings: \n\t" + e.message);
        }
    }

    fetchSocketSettings(){
        var url = "http://192.168.2.145:8099/getInfo?";
        var params = {
            table : "DeviceSettings",
            keyName : "deviceID",
            keyValue : "*"
        };
        params = new URLSearchParams(params);

        fetch(url + params)
        .then((response) => response.json())
        .then((devicesData) => {
            this.devicesData = devicesData;
            this.sockets = [];
            this.devicesData.map((socket) => this.sockets.push(socket["deviceName"]));
        })
        .catch(error => {
            throw error; // if there's an error, it will be logged to the console
        });
    }

    fetchHouseSettings(){
        var url = "http://192.168.2.145:8099/getInfo?";
        var params = {
            table : "HouseSettings",
            keyName : "houseID",
            keyValue : "H1"
        };
        params = new URLSearchParams(params);

        fetch(url + params)
        .then((response) => response.json())
        .then((houseData) => {
            this.houseData = houseData[0];
        })
        .catch(error => {
            throw error; // if there's an error, it will be logged to the console
        });
    }

    fetchData(){ // Fetch sockets settings
        try{
            this.fetchSocketSettings();
            this.fetchHouseSettings();
        } catch(e){
            alert("An error occurred while fetching settings: \n\t" + e.message);
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.devicesData = false;
        this.houseData = false;
        this.loadSocketSettings = false;
        this.loadHouseSettings = false;
        this.fetchData();
    }

    render() {
        if(!this.devicesData | !this.houseData){
            return html`
                <div> Loading... </div>
            `;
        } else {
            this.setMobileTheme();
            return html`
                <app-header fixed="" slot="header"> </app-header>
                
                <div class="container" id="container" @err_occ=${this.errorHandler} @click=${this.resetSavedState}>
                    
                    <div id="main-page" class="main-page" @click="${this.loadHACards}">
                        ${this.sockets.map((item) => html`<div class="child">
                            <ha-card outlined class="socket_button" @click="${() => this.show_socket_settings(item)}">
                                <div name="button_text" class="button_text">${item}</div>
                            </ha-card>
                        </div>`)}
                    </div>

                    ${this.loadSocketSettings ? html`<socket-settings id="socket-settings" class="settings" .hass=${this.hass} .extData=${this.extDeviceData}></socket-settings>` : ""}
                    
                    ${this.loadHouseSettings ? html`<house-settings id="house-settings" class="settings" .hass=${this.hass} .extData=${this.houseData}></house-settings>` : ""}

                    <div class="btn_cont" id="btn_cont">
                        <mwc-button class="back_btn" id="back_btn" @click=${this.hide_settings}>
                            <ha-icon class="arrowLeft" id="arrowLeft" icon="mdi:arrow-left"></ha-icon>
                        </mwc-button>
                        <mwc-button class="save_btn" id="save_btn" @click=${this.save}>
                            <ha-icon class="okTick" id="okTick" icon="mdi:check"></ha-icon>
                            <div id="save_btn_text">Save</div>
                        </mwc-button>
                    </div>

                    <div class="gen_settings_button" id="gen_settings_button" @click=${this.show_house_settings}>
                        <div class="icon_dot" id="icon_dot">
                            <ha-icon class="cog" id="cog" icon="mdi:cog"></ha-icon> 
                        </div>
                    </div>

                    
                </div>
            `;
        }
    }

    static get styles() {
        return css`
            .container{
                float: left;
                margin-top: 3px;
                margin-left: 5px;
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
            }
            
            .main-page{
                display: flex;
            }

            .child{
                width: 100px;
                height: 100px;
                color: white;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
                justify-content: center;
            }

            .socket_button{
                width: 90%;
                aspect-ratio: 1;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
                justify-content: center;
            }

            .settings{
                display: none;
                padding-top: 56px; //var(--pd-top);
            }

            .btn_cont{
                margin-top: 10px;
                display: none;
                width: 582px;
            }

            .save_btn{
                margin-left: auto;
            }

            .okTick{
                display: none;
                padding-right: 5px;
            }

            .gen_settings_button{
                position: fixed;
                bottom: 20px;
                right: 20px;
            }

            .icon_dot{
                background-color: var(--primary-color);
                aspect-ratio: 1;
                width: 40px;
                border-radius: 50%;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
                justify-content: center;
            }
        `;
    }
}

customElements.define("main-page", MainPage);