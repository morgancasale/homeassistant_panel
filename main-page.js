import {
    LitElement,
    html,
    css
} from "https://cdn.skypack.dev/lit-element@2.4.0/lit-element.js";

//import { unsafeHTML } from 'https://cdn.skypack.dev/lit@2.4.0/directives/unsafe-html.js';
import "https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js";

import "./socket-settings.js";

class MainPage extends LitElement {
    static get properties() {
        return {
            hass: { type: Object, attribute: false },
            narrow: { type: Boolean },
            route: { type: Object },
            panel: { type: Object },
            data: { type: Object },
            loadSettings: { type: Boolean }
        };
    }
    
    constructor(){
        super();
        this.data = {};
        this.errState = false;
    }

    hide_socket(){
        this.fetchData();
        this.shadowRoot.getElementById("container").style.justifyContent = "";
        this.shadowRoot.getElementById("socket-settings").style.display = "none";
        this.shadowRoot.getElementById("btn_cont").style.display = "none";

        this.shadowRoot.getElementById("main-page").style.display = "flex";

        this.loadSettings = false;
        this.resetSavedState();
        this.reRender();
        this.resetDelState();
    }

    async reRender(){
        await this.render();
        await new Promise(r => setTimeout(r, 1));
    }

    getSocketData(socket_name){
        return this.data.find(el => el["deviceName"] == socket_name);
    }

    async show_settings(socket) {
        this.socketData = this.getSocketData(socket);
        this.extData = this.socketData;
        this.loadSettings = true;
        await this.reRender();

        this.shadowRoot.getElementById("socket-settings").setData(this.socketData);
        this.shadowRoot.getElementById("main-page").style.display = "none";

        this.shadowRoot.getElementById("container").style.justifyContent = "center";
        this.shadowRoot.getElementById("socket-settings").style.display = "flex";
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

    save(){
        try{
            this.socketData = this.shadowRoot.getElementById("socket-settings").save();
            this.socketData.deviceID = this.extData.deviceID;
            this.socketData.deviceName = (this.socketData.deviceName != this.extData.deviceName) ? 
                                this.socketData.deviceName : this.extData.deviceName;

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
                body: JSON.stringify([this.socketData])// body data type must match "Content-Type" header
            };
            
            if(!this.errState){
                fetch(url, request)
                .then((response) => {
                    this.SavedState(response.ok);
                })
                .catch(error => {
                    throw new Error("An error occured while performing PUT: \n\t" + error.message);
                });
            }
        } catch(e){
            alert("Error in the main page: \n\t" + e.message);
        }
    }

    fetchData(){ // Fetch sockets settings
        var url = "http://192.168.2.145:8099/getInfo?";
        var params = {
            table : "DeviceSettings",
            keyName : "deviceID",
            keyValue : "*"
        };
        params = new URLSearchParams(params);

        fetch(url + params)
        .then((response) => response.json())
        .then((data) => {
            this.data = data;
            this.sockets = [];
            this.data.map((socket) => this.sockets.push(socket["deviceName"]));
        })
        .catch(error => {
            console.error(error); // if there's an error, it will be logged to the console
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.data = false;
        this.loadSettings = false;
        this.fetchData();
    }

    render() {
        if(!this.data){
            return html`
                <div> Loading... </div>
            `;
        } else {
            this.setMobileTheme();
            return html`
                <app-header fixed="" slot="header"> </app-header>
                
                <div class="container" id="container" @err_occ=${this.errorHandler}>
                    
                    <div id="main-page" class="main-page" @click="${this.loadHACards}">
                        ${this.sockets.map((item) => html`<div class="child">
                            <ha-card outlined class="socket_button" @click="${() => this.show_settings(item)}">
                                <div name="button_text" class="button_text">${item}</div>
                            </ha-card>
                        </div>`)}
                    </div>

                    ${this.loadSettings ? html`<socket-settings id="socket-settings" class="socket-settings" .hass=${this.hass} .extData=${this.extData}></socket-settings>` : ""}
                    
                    <div class="btn_cont" id="btn_cont">
                        <mwc-button class="back_btn" id="back_btn" @click=${this.hide_socket}>
                            <ha-icon class="arrowLeft" id="arrowLeft" icon="mdi:arrow-left"></ha-icon>
                        </mwc-button>
                        <mwc-button class="save_btn" id="save_btn" @click=${this.save}>
                            <ha-icon class="okTick" id="okTick" icon="mdi:check"></ha-icon>
                            <div id="save_btn_text">Save</div>
                        </mwc-button>
                    </div>
                </div>
            `;
        }
    }

    static get styles() {
        return css`
            .container{
                width: 100%;
                height: 100%;
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

            .socket-settings{
                display: none;
                width: 100%;
                justify-content: center;
                align-content: flex-start;
                flex-wrap: wrap;
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
        `;
    }
}

customElements.define("main-page", MainPage);