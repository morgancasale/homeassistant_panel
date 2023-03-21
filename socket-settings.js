import "https://unpkg.com/wired-card@2.1.0/lib/wired-card.js?module";
import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import {unsafeHTML} from 'https://unpkg.com/lit@2.4.0/directives/unsafe-html.js?module';

import "./scheduling-card.js";

import "./socket-menu-exp.js";

import "./max-power-card.js";

import "./parasitic-control.js";

import "./fault-control.js";

import "./appl-type-card.js";

import "./faulty-behaviour-card.js"

import { generalStyles } from "./general_styles.js";

class SocketSettings extends LitElement {
    static get properties() {
        return {
            hass : { type : Object },
            narrow : { type : Boolean },
            route : { type : Object },
            panel : { type : Object },
            socket_name : { type : String },
            extData : { type: Object }
        };
    }

    pageTemplate = (children) =>`
        <div class="container" id="container">
            ${unsafeHTML(children)}
        </div>
    `;

    show_socket_stgs(num, show = true){
        var el = this.shadowRoot.getElementById("socket_stgs" + num);
        if((el.getAttribute("status") == "hidden") && show){
            el.style.display = "flex";
            el.setAttribute("status", "shown");
            this.shadowRoot.getElementById("socket_menu_exp" + num).shadowRoot.getElementById("chevron").setAttribute("icon", "mdi:chevron-up");
        } else{
            el.style.display = "none";
            el.setAttribute("status", "hidden");
            this.shadowRoot.getElementById("socket_menu_exp" + num).shadowRoot.getElementById("chevron").setAttribute("icon", "mdi:chevron-down");
        }
    }

    HideSockets(state){
        if(state){ //HPMode ON
            this.shadowRoot.getElementById("socket1").style.display = "none";
            this.show_socket_stgs(1, false);
            this.shadowRoot.getElementById("socket3").style.display = "none";
            this.show_socket_stgs(3, false);                                   //turning OFF left and right sockets
        } else { //HPMode OFF
            this.shadowRoot.getElementById("socket1").style.display = "block";
            this.shadowRoot.getElementById("socket3").style.display = "block"; //turning ON left and right sockets
        }
    }

    SetHPMode(){
        var btn = this.shadowRoot.getElementById("HP_button");
        var btn_state = btn.checked;

        if(btn_state != this.extData.HPMode){
            btn.click();
        }
    }

    HPMode(){
        var btn = this.shadowRoot.getElementById("HP_button");
    
        var state = !btn.checked;
        this.HideSockets(state);
        if(state){ //HPMode ON
            this.shadowRoot.getElementById("appl-type-card").style.display = "flex";
            if(this.FaultBehActive){
                this.shadowRoot.getElementById("fault_beh").style.display = "flex";
            }
            this.data.HPMode = true;
        } else {  //HPMode OFF
            this.shadowRoot.getElementById("appl-type-card").style.display = "none";
            this.shadowRoot.getElementById("fault_beh").style.display = "none";
            this.data.HPMode = false;
        }
    }

    ShowApplType(socket_num){
        var par_ctrl = this.shadowRoot.getElementById("par_ctrl" + socket_num).shadowRoot;
        par_ctrl.querySelector("#mode_sel_cont").style.display = "flex";
        par_ctrl.querySelector("#manual_thr").style.marginLeft = "auto";
    }

    ShowFaultyBehaviour(){
        this.FaultBehActive = true;
        this.shadowRoot.getElementById("fault_beh").style.display = "flex";
    }

    ApplSetHandler(event){
        event.preventDefault();
        var socket_num = event.detail.message.socket_num;
        var ApplType = event.detail.message.type;
        this.ShowApplType(socket_num);
        this.ShowFaultyBehaviour();
    }

    getSavedData(element){
        var sch_data = [];
        for(let i=1; i<4; i++){
            sch_data[i-1] = this.shadowRoot.getElementById(element + i).save();
        }
        return sch_data;
    }
    
    save(){
        this.data.socketName = this.shadowRoot.getElementById("dev_input_field").value;
        this.data.scheduling = this.getSavedData("sched");
        this.data.maxPower = this.getSavedData("max-pow");
        this.data.faultCtrl = this.getSavedData("fault-ctrl");
        this.data.parCtrl = this.getSavedData("par_ctrl");
        if(this.data.HPMode){
            this.data.applType = this.shadowRoot.getElementById("appl-type-card").save();
            this.data.faultyBehCtrl = this.shadowRoot.getElementById("fault_beh").save();
        }
    }

    setData(data = this.extData){
        this.outData = data;
        this.SetHPMode();
        ["1", "2", "3"].map((i) =>{
            this.shadowRoot.getElementById("sched" + i).setData();
            this.shadowRoot.getElementById("max-pow" + i).setData();
            this.shadowRoot.getElementById("fault-ctrl" + i).setData();
            this.shadowRoot.getElementById("par_ctrl" + i).setData();
        });
        this.shadowRoot.getElementById("appl-type-card").setData();
        this.shadowRoot.getElementById("fault_beh").setData();
    }

    resetData(){
        this.setData(this.defaultData);
    }

    render() {
        var default_sched = {
            "ON": ["ciao", "miao", "bao"],
            "OFF": ["pizza", "pasta", "grullo", "pasto"]
        }
    
        var default_maxPower = {
            "MP" : false,
            "max_power" : "",
            "mode" : ""
        }
    
        var default_parCtrl = {
            "parCtrl" : false,
            "threshold" : "",
            "mode" : ""
        }
    
        this.defaultData = {
            "socketName" : null,
            "HPMode" : false,
            "scheduling" : [
                default_sched,
                default_sched,
                default_sched
            ],
            "maxPower" : [
                default_maxPower,
                default_maxPower,
                default_maxPower
            ],
            "faultCtrl" : [false, false, false],
            "parCtrl" : [
                default_parCtrl,
                default_parCtrl,
                default_parCtrl
            ],
            "applType" : "None",
            "faultyBehCtrl" : {
                "FBC" : false,
                "mode" : ""
            }
        }

        this.outData = this.defaultData;

        this.data = this.defaultData;

        return html`
            <ha-card outlined class="card" id="card" @appl_type_set="${this.ApplSetHandler}">
                <div class="SingleEntry" id="change_device_name">
                    <div class="description">Change device name:</div>
                    <div class="dev_name_input">
                        <ha-form>
                            <ha-textfield id="dev_input_field" label=${this.extData.socket_name}>Name</ha-textfield>
                        </ha-form>
                    </div>
                </div>
                <div class="SingleEntry" id="HP_btn">
                    <div class="description" id="HP">High Power Mode</div>
                    <div class="button_cont">
                        <ha-switch id="HP_button" @click="${this.HPMode}"></ha-switch>
                    </div>
                </div>

                <div class="socket" id="socket1">
                    <div class="SingleEntry" id="socket_menu1" @click="${() => this.show_socket_stgs("1")}">
                        <socket-menu-exp id="socket_menu_exp1" style="width: 100%" .socket_pos=${"Left Socket"}></socket-menu-exp>
                    </div>

                    <div class="socket_stgs" id="socket_stgs1" status="hidden">
                        <scheduling-card id="sched1" .hass=${this.hass} .extData=${this.outData.scheduling[0]} .HPMode=${this.data.HPMode}></scheduling-card>
                        <max-power-card id="max-pow1" .extData=${this.outData.maxPower[0]} .HPMode=${this.data.HPMode}></max-power-card>
                        <fault-control id="fault-ctrl1" .extData=${this.outData.faultCtrl[0]} .HPMode=${this.data.HPMode}></fault-control>
                        <parasitic-control id="par_ctrl1" .extData=${this.outData.parCtrl[0]} .HPMode=${this.data.HPMode}></parasitic-control>                        
                    </div>
                </div>

                <div id="socket2">
                    <div class="SingleEntry" id="socket_menu2" @click="${() => this.show_socket_stgs("2")}">
                        <socket-menu-exp id="socket_menu_exp2" style="width: 100%" .socket_pos=${"Center Socket"}></socket-menu-exp>
                    </div>

                    <div class="socket_stgs" id="socket_stgs2" status="hidden">
                        <scheduling-card id="sched2" .hass=${this.hass} .extData=${this.outData.scheduling[1]} .HPMode=${false}></scheduling-card>
                        <max-power-card  id="max-pow2" .extData=${this.outData.maxPower[1]} .HPMode=${false}></max-power-card>
                        <fault-control id="fault-ctrl2" .extData=${this.outData.faultCtrl[1]} .HPMode=${false}></fault-control>
                        <appl-type-card id="appl-type-card" class="appl-type-card" .extData=${this.outData.applType} .socket_num=${"2"} .HPMode=${this.data.HPMode}></appl-type-card>
                        <faulty-behaviour-card id="fault_beh" class="fault_beh" .extData=${this.outData.faultyBehCtrl}></faulty-behaviour-card>
                        <parasitic-control id="par_ctrl2" .extData=${this.outData.parCtrl[1]} .HPMode=${false}></parasitic-control>
                    </div>
                </div>

                <div id="socket3" @appl_type_set="${this.ApplSetHandler}">
                    <div class="SingleEntry" id="socket_menu3" @click="${() => this.show_socket_stgs("3")}">
                        <socket-menu-exp id="socket_menu_exp3" style="width: 100%" .socket_pos=${"Right Socket"}></socket-menu-exp>
                    </div>

                    <div class="socket_stgs" id="socket_stgs3" status="hidden">
                        <scheduling-card id="sched3" .hass=${this.hass} .extData=${this.outData.scheduling[2]} .HPMode=${this.data.HPMode}></scheduling-card>
                        <max-power-card id="max-pow3" .extData=${this.outData.maxPower[2]} .HPMode=${this.data.HPMode}></max-power-card>
                        <fault-control id="fault-ctrl3" .extData=${this.outData.faultCtrl[2]} .HPMode=${this.data.HPMode}></fault-control>
                        <parasitic-control id="par_ctrl3" .extData=${this.outData.parCtrl[2]} .HPMode=${this.data.HPMode}></parasitic-control>                        
                    </div>
                </div>
            </ha-card>
        `;
    }

    static style = [
        generalStyles,

        css`
            .card{
                width: 584px;
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
                justify-content: center;
                //border-radius: var(--border-radius);
                //border-width: var(--border-width);
            }

            .c_card{
                margin-bottom: 5px;
            }

            .SingleEntry{
                width: 542px;
                height: 72px;
                display: flex;
                padding-left: 20px;
                padding-right: 20px;
                align-content: center;
                flex-wrap: wrap;
            }

            .dev_name_input{
                display: flex;
                flex-wrap: wrap;
                align-content: center;
                margin-left: auto;
            }

            .button_cont{
                margin-left: auto;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }

            .socket_stgs{
                display: none;
                flex-wrap: wrap;            
            }

            .appl-type-card{
                display: none;
            }

            .fault_beh{
                display: none;
            } 
        `
    ]

    static get styles() {
        return this.style
    }
}
customElements.define("socket-settings", SocketSettings);