import "https://unpkg.com/wired-card@2.1.0/lib/wired-card.js?module";
import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { generalStyles } from "./general_styles.js";

//import "https://unpkg.com/@material/web@1.0.0-pre.4/index.js?module"

//import "../ha-frontend/src/panels/lovelace/entity-rows/hui-input-datetime-entity-row"

class MaxPowerCard extends LitElement {
    static get properties() {
        return {
            hass: { type: Object },
            narrow: { type: Boolean },
            route: { type: Object },
            panel: { type: Object },
            HPMode : { type: Boolean},
            extData: { type: Object }
        };
    }

    MPControl() {
        var state = !this.shadowRoot.getElementById("MP_button").checked;
        this.data.MPControl = state;
        if (state) {
            this.shadowRoot.getElementById("max_power_settings").style.display = "flex";
        } else {
            this.shadowRoot.getElementById("max_power_settings").style.display = "none";
        }
    }

    _onModeSelected(ev) {
        this.data.MPMode = ev.target.value;
    }

    sendEvent(event_name, event_msg){
        let Event = new CustomEvent(event_name, {
            detail: { message: event_msg },
            bubbles: true,
            composed: true 
        });
        this.dispatchEvent(Event);
    }

    signalError(msg){
        alert(msg);
        this.sendEvent("err_occ", true);
    }

    checkMaxPower(){
        if(this.data.maxPower == null){
            this.signalError("A value for Max Power must be entered.");
            this.shadowRoot.getElementById("max_power_input_field").invalid = true;
        } else {
            if(parseInt(this.data.maxPower) < 0){
                this.signalError("Max Power value must be positive.");
                this.shadowRoot.getElementById("max_power_input_field").invalid = true;
            }
        }
    }

    resetValid(){
        this.shadowRoot.getElementById("max_power_input_field").invalid = false;
    }

    checkMode(){
        if(this.data.maxPower != null & this.data.MPMode == null){
            this.signalError("A mode for the Max Power control must be selected.")
        }
    }

    save(){
        if(this.data.MPControl & !this.data.HPMode){
            this.data.maxPower = this.shadowRoot.getElementById("max_power_input_field").value;
            this.data.maxPower = (this.data.maxPower == undefined) ? null : this.data.maxPower;
            
            this.checkMode();
            this.checkMaxPower();
        } else {
            this.data.MPControl = false;
        }
        
        return this.data;
    }

    setMPControl(data){
        var btn = this.shadowRoot.getElementById("MP_button");
        if(btn.checked != data.MPControl){
            btn.click();
        }
    }

    setMaxPower(data){
        this.shadowRoot.getElementById("max_power_input_field").value = data.maxPower;
    }

    setMode(data){
        this.shadowRoot.getElementById("mode_sel").value = data.MPMode;
    }

    setData(data = this.extData){
        this.extData = data;
        this.setMPControl(data);
        this.setMaxPower(data);
        this.setMode(data);
    }

    resetData(){
        this.setData(this.defaultData);
    }

    render() {
        this.defaultData = {
            "MPControl" : false,
            "maxPower" : "",
            "MPMode" : ""
        }

        this.data = this.defaultData;
        
        return html`
            <ha-card class="Max-Power">
                <div class="SingleEntry max_power_btn">
                    <div class="description" id="btn_descr">Max Power Control</div>
                    <div class="button_cont">
                        <ha-switch id="MP_button" @click="${this.MPControl}"></ha-switch>
                    </div>
                </div>
                <div class="max_power_settings SingleEntry" id="max_power_settings">
                    <div class="ch_max_power" id="ch_max_power">
                        <div class="description" id="max_power_descr"> Max Power : </div>
                        <ha-textfield class="max_power_input_field" id="max_power_input_field" @click=${this.resetValid}>Power</ha-textfield>
                        <div class="max_power_unit description" id="max_power_unit"> W </div>
                    </div>
                    <div class="max_power_mode" id="max_power_mode">
                        <div class="description" id="max_power_mode_descr"> Mode: </div>
                        <ha-select class="mode_sel" id="mode_sel" label="Choose mode" @selected=${this._onModeSelected}>
                            ${["Notify", "Turn OFF"].map((item) => html`<mwc-list-item .value=${item}>${item}</mwc-list-item>`)}
                        </ha-select>
                    </div>
                </div>
            </ha-card>
        `;
    }

    static style = [
        generalStyles,
        css`
            .Max-Power{
                padding-bottom: 5px;
            }
            
            .max_power_settings{
                display: none;
            }

            .button_cont{
                margin-left: auto;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }

            .max_power_mode{
                margin-left: auto;
            }

            .ch_max_power{
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }

            .max_power_mode{
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }
            
            .max_power_input_field{
                width: 100px;
            }

            .max_power_unit{
                margin-left: 10px;
            }
        `
    ]

    static get styles() {
        return this.style;
    }
}
customElements.define("max-power-card", MaxPowerCard);