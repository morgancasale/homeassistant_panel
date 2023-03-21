import {
    LitElement,
    html,
    css
} from "https://cdn.skypack.dev/lit-element@2.4.0/lit-element.js";

//import { unsafeHTML } from 'https://cdn.skypack.dev/lit@2.4.0/directives/unsafe-html.js';

import "./socket-settings.js";

//import "https://cdn.skypack.dev/@material/web@1.0.0-pre.4/radio/radio.js";

class MainPage extends LitElement {
    static get properties() {
        return {
            hass: { type: Object, attribute: false },
            narrow: { type: Boolean },
            route: { type: Object },
            panel: { type: Object },
        };
    }

    socket_num = 100

    pageTemplate = (children) => `
        <div class="container" id="container">
            ${unsafeHTML(children)}
        </div>
    `;

    hide_socket(){
        this.shadowRoot.getElementById("container").style.justifyContent = "";
        this.shadowRoot.getElementById("socket-settings").style.display = "none";
        this.shadowRoot.getElementById("btn_cont").style.display = "none";

        this.shadowRoot.getElementById("main-page").style.display = "flex";
    }

    default_sched = {
        "ON": ["ciao", "miao", "bao"],
        "OFF": ["pizza", "pasta", "grullo", "pasto"]
    }

    default_maxPower = {
        "MP" : false,
        "max_power" : "",
        "mode" : ""
    }

    default_parCtrl = {
        "parCtrl" : false,
        "threshold" : "",
        "mode" : ""
    }

    extData = {
        "socketName" : null,
        "HPMode" : false,
        "scheduling" : [
            this.default_sched,
            this.default_sched,
            this.default_sched
        ],
        "maxPower" : [
            this.default_maxPower,
            this.default_maxPower,
            this.default_maxPower
        ],
        "faultCtrl" : [false, false, false],
        "parCtrl" : [
            this.default_parCtrl,
            this.default_parCtrl,
            this.default_parCtrl
        ],
        "applType" : "None",
        "faultyBehCtrl" : {
            "FBC" : false,
            "mode" : ""
        }
    }

    show_socket(socket) {
        this.shadowRoot.getElementById("socket-settings").update();
        this.extData.socketName = socket;
        this.shadowRoot.getElementById("socket-settings").shadowRoot.getElementById("dev_input_field").setAttribute("label", socket)
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
        /*prese.map((item) =>
         0 = 0
        );*/
        this.shadowRoot.getElementById("socket-settings").save()
    }

    render() {
        const prese = ["Presa 0", "Presa 1", "Presa 2"]

        this.data = {}
        prese.map((item) =>
            this.data[item] = {}
        );

        this.setMobileTheme();
        return html`
            <app-header fixed="" slot="header"> </app-header>
            <div class="container" id="container" @err_occ=${this.errorHandler}>
                <div id="main-page" class="main-page" @click="${this.loadHACards}">
                    ${prese.map((item) => html`<div class="child">
                        <ha-card outlined class="socket_button" @click="${() => this.show_socket(item)}">
                            <div name="button_text" class="button_text">${item}</div>
                        </ha-card>
                    </div>`)}
                </div>

                <socket-settings id="socket-settings" class="socket-settings" .hass=${this.hass} .extData=${this.extData}></socket-settings>
                <div class="btn_cont" id="btn_cont">
                    <mwc-button class="back_btn" id="back_btn" @click=${this.hide_socket}>
                        <ha-icon class="arrowLeft" id="arrowLeft" icon="mdi:arrow-left"></ha-icon>
                    </mwc-button>
                    <mwc-button class="save_btn" id="save_btn" label="Save" @click=${this.save}></mwc-button>
                </div>
            </div>
        `;
    }

    gen_presa(n) {
        var presa = html`
            <div class="child">
                <ha-card outlined class="socket_button" @click="${() => this.show_socket(n)}">
                    <slot name="button_text" class="button_text">Presa ${n}</slot>
                </ha-card>
            </div>
            `;
        return presa;
    }


    gen_children() {
        var children = "";
        for (let i = 0; i < 7; i++) {
            children += this.gen_presa(i);
        }
        return children;
    }

    /*update(){
        var el = this.shadowRoot.getElementById("main-page");
        el = el;
    }*/


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