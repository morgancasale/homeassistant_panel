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

            var par_ctrl = this.shadowRoot.getElementById("par_ctrl").shadowRoot;
            par_ctrl.querySelector("#mode_sel_cont").style.display = "none";
            par_ctrl.querySelector("#manual_thr").style.marginLeft = "";

            this.data.HPMode = false;
        }
    }

    ShowApplType(){
        var par_ctrl = this.shadowRoot.getElementById("par_ctrl").shadowRoot;
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
        this.ShowApplType();
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
        this.data.scheduling = this.getSavedData("sched") 
        this.data.maxPower = this.shadowRoot.getElementById("max-pow").save();
        this.data.faultControl = this.shadowRoot.getElementById("fault-ctrl").save();
        this.data.parControl = this.shadowRoot.getElementById("par_ctrl").save();
        if(this.data.HPMode){
            this.data.applianceType = this.shadowRoot.getElementById("appl-type-card").save();
            this.data.faultyBehCtrl = this.shadowRoot.getElementById("fault_beh").save();
        }
    }

    setData(data = this.extData){
        this.outData = data;
        this.SetHPMode();
        [0, 1, 2].map((i) =>{
            var schedData = [];
            schedData = data["scheduling"].filter(el => el["socketID"] == i);
            this.shadowRoot.getElementById("sched" + (i+1).toString()).setData(schedData);
        });
        
        this.shadowRoot.getElementById("max-pow").setData({
            MPControl : data["MPControl"],
            maxPower : data["maxPower"],
            MPMode : data["MPMode"]
        });
        this.shadowRoot.getElementById("fault-ctrl").setData(data["faultControl"]);
        this.shadowRoot.getElementById("par_ctrl").setData({
            parControl : data["parControl"],
            parThreshold : data["parThreshold"],
            parMode : data["parMode"]
        });
        this.shadowRoot.getElementById("appl-type-card").setData(data["applianceType"]);
        this.shadowRoot.getElementById("fault_beh").setData({
            FBControl : data["FBControl"],
            FBMode : data["FBMode"]
        });
    }

    resetData(){
        this.setData(this.defaultData);
    }

    render() {    
        this.defaultData = {
            "deviceID" : null,
            "deviceName" : null,
            "HPMode" : false,
            "scheduling" : [
                {
                    "socketID" : 0,
                    "startSchedule" : "DD:MM:YYYY HH:MM",
                    "enableEndSchedule" : false,
                    "endSchedule" : "DD:MM:YYYY HH:MM",
                    "repeat" : 0
                },
                {
                    "socketID" : 1,
                    "startSchedule" : "DD:MM:YYYY HH:MM",
                    "enableEndSchedule" : false,
                    "endSchedule" : "DD:MM:YYYY HH:MM",
                    "repeat" : 0
                },
                {
                    "socketID" : 2,
                    "startSchedule" : "DD:MM:YYYY HH:MM",
                    "enableEndSchedule" : false,
                    "endSchedule" : "DD:MM:YYYY HH:MM",
                    "repeat" : 0
                }
            ],
            "maxPowerControl" : {
                "MPControl" : false,
                "maxPower" : 0,
                "MPMode" : "Notify"
            },
            "faultControl" : false,
            "parasiticControl" : {
                "parControl" : false,
                "parThreshold" : 0,
                "parMode" : "Manual"
            },
            "applianceType" : "None",
            "faultyBehControl" : {
                "FBControl" : false,
                "FBMode" : ""
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
                            <ha-textfield id="dev_input_field" label=${this.extData.deviceName}>Name</ha-textfield>
                        </ha-form>
                    </div>
                </div>
                <ha-card>
                    <div class="SingleEntry" id="HP_btn">
                        <div class="description" id="HP">High Power Mode</div>
                        <div class="button_cont">
                            <ha-switch id="HP_button" @click="${this.HPMode}"></ha-switch>
                        </div>
                    </div>
                </ha-card>

                <max-power-card id="max-pow" .extData=${this.outData.maxPowerControl} .HPMode=${this.data.HPMode}></max-power-card>
                <fault-control id="fault-ctrl" .extData=${this.outData.faultControl} .HPMode=${this.data.HPMode}></fault-control>
                <parasitic-control id="par_ctrl" .extData=${this.outData.parasiticControl} .HPMode=${this.data.HPMode}></parasitic-control> 

                <div class="socket" id="socket1">
                    <div class="SingleEntry" id="socket_menu1" @click="${() => this.show_socket_stgs("1")}">
                        <socket-menu-exp id="socket_menu_exp1" style="width: 100%" .socket_pos=${"Left Socket"}></socket-menu-exp>
                    </div>

                    <div class="socket_stgs" id="socket_stgs1" status="hidden">
                        <scheduling-card id="sched1" .hass=${this.hass} .extData=${this.outData.scheduling[0]} .HPMode=${this.data.HPMode}></scheduling-card>                        
                    </div>
                </div>

                <div id="socket2">
                    <div class="SingleEntry" id="socket_menu2" @click="${() => this.show_socket_stgs("2")}">
                        <socket-menu-exp id="socket_menu_exp2" style="width: 100%" .socket_pos=${"Center Socket"}></socket-menu-exp>
                    </div>

                    <div class="socket_stgs" id="socket_stgs2" status="hidden">
                        <scheduling-card id="sched2" .hass=${this.hass} .extData=${this.outData.scheduling[1]} .HPMode=${false}></scheduling-card>
                        <appl-type-card id="appl-type-card" class="appl-type-card" .extData=${this.outData.applianceType} .socket_num=${"2"} .HPMode=${this.data.HPMode}></appl-type-card>
                        <faulty-behaviour-card id="fault_beh" class="fault_beh" .extData=${this.outData.faultyBehControl}></faulty-behaviour-card>
                    </div>
                </div>

                <div id="socket3" @appl_type_set="${this.ApplSetHandler}">
                    <div class="SingleEntry" id="socket_menu3" @click="${() => this.show_socket_stgs("3")}">
                        <socket-menu-exp id="socket_menu_exp3" style="width: 100%" .socket_pos=${"Right Socket"}></socket-menu-exp>
                    </div>

                    <div class="socket_stgs" id="socket_stgs3" status="hidden">
                        <scheduling-card id="sched3" .hass=${this.hass} .extData=${this.outData.scheduling[2]} .HPMode=${this.data.HPMode}></scheduling-card>
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