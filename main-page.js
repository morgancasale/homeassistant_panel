import {
    LitElement,
    html,
    css
} from "https://cdn.skypack.dev/lit-element@2.4.0/lit-element.js";

//import { unsafeHTML } from 'https://cdn.skypack.dev/lit@2.4.0/directives/unsafe-html.js';

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
    }

    hide_socket(){
        this.shadowRoot.getElementById("container").style.justifyContent = "";
        this.shadowRoot.getElementById("socket-settings").style.display = "none";
        this.shadowRoot.getElementById("btn_cont").style.display = "none";

        this.shadowRoot.getElementById("main-page").style.display = "flex";

        this.loadSettings = false;
        this.reRender();
    }

    async reRender(){
        await this.render();
        await new Promise(r => setTimeout(r, 1));
    }

    getSocketData(socket_name){
        return this.data.find(el => el["deviceName"] == socket_name);
    }

    async show_settings(socket) {
        this.extData = this.getSocketData(socket);
        this.loadSettings = true;
        await this.reRender();

        this.shadowRoot.getElementById("socket-settings").setData();
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

        this.shadowRoot.getElementById("socket-settings").setData();
    }

    errorHandler(ev){
        ev.preventDefault();
        this.error = ev.detail.message;
    }

    save(){
        this.shadowRoot.getElementById("socket-settings").save()
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
        /*this.data = [this.extData];
        this.sockets = [];
        this.data.map((socket) => this.sockets.push(socket["deviceName"]));*/
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
                        <mwc-button class="save_btn" id="save_btn" label="Save" @click=${this.save}></mwc-button>
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

        `;
    }
}

customElements.define("main-page", MainPage);