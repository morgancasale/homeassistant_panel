import "https://unpkg.com/wired-card@2.1.0/lib/wired-card.js?module";
import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { generalStyles } from "./general_styles.js";

//import "https://unpkg.com/@material/web@1.0.0-pre.4/index.js?module"

//import "../ha-frontend/src/panels/lovelace/entity-rows/hui-input-datetime-entity-row"

class ParasiticControl extends LitElement {
    static get properties() {
        return {
            hass: { type: Object },
            narrow: { type: Boolean },
            route: { type: Object },
            panel: { type: Object },
            HPMode: { type: Boolean }
        };
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

    ParControl() {
        var state = this.shadowRoot.getElementById("par_ctrl_btn").shadowRoot.getElementById("basic-switch").getAttribute("aria-checked");
        this.data.Par_ctrl = (state == "false");
        if (state == "false") {
            this.shadowRoot.getElementById("par_ctrl_settings").style.display = "flex";
        } else {
            this.shadowRoot.getElementById("par_ctrl_settings").style.display = "none";
        }
    }

    AutoMode() {
        var btn = this.shadowRoot.getElementById("auto_mode_btn");
        this.auto_mode = btn.checked;

        if (this.auto_mode) {
            this.shadowRoot.getElementById("par_ctrl_input_field").disabled = false;
        } else {
            this.shadowRoot.getElementById("par_ctrl_input_field").disabled = true;
        }
    }

    _onModeSelected(ev) {
        this.data.mode = ev.target.value;
        if(this.data.mode == "Auto"){
            this.shadowRoot.getElementById("par_ctrl_input_field").disabled = true;
        } else {
            this.shadowRoot.getElementById("par_ctrl_input_field").disabled = false;
        }
    }

    resetValid(){
        this.shadowRoot.getElementById("par_ctrl_input_field").invalid = false;
    }

    checkThreshold(){
        if(this.data.threshold == null){
            this.signalError("A value for the power Threshold must be entered.");
            this.shadowRoot.getElementById("par_ctrl_input_field").invalid = true;
        } else {
            if(parseInt(this.data.threshold) < 0){
                this.signalError("The Threshold value must be positive.");
                this.shadowRoot.getElementById("par_ctrl_input_field").invalid = true;
            }
        }
    }

    checkMode(){
        var cond = this.data.threshold != null & this.data.mode == null;
        cond &= (this.shadowRoot.getElementById("mode_sel_cont").style.display == "flex");
        if(cond){
            this.signalError("A mode for the Parasitic control must be selected.")
        }
    }

    save(){
        if(this.data.Par_ctrl & !this.HPMode){
            this.data.threshold = this.shadowRoot.getElementById("par_ctrl_input_field").value;
            this.data.threshold = (this.data.threshold == undefined) ? null : this.data.threshold;

            this.checkMode();
            this.checkThreshold();
        } else {
            this.data.Par_ctrl = false;
        }

        return this.data;
    }

    setParCtrl(data){
        var btn = this.shadowRoot.getElementById("par_ctrl_btn");

        if(btn.checked != data.parCtrl){
            btn.click();
        }
    }

    setThreshold(data){
        this.shadowRoot.getElementById("par_ctrl_input_field").value = data.threshold;
    }

    setMode(data){
        this.shadowRoot.getElementById("mode_sel").value = data.mode;
    }

    setData(data = this.extData){
        this.setParCtrl(data);
        this.setThreshold(data);
        this.setMode(data);
    }

    resetData(){
        this.setData(this.defaultData);
    }

    render() {
        this.defaultData = {
            "Par_ctrl" : false,
            "threshold" : "",
            "mode" : ""
        };

        this.data = this.defaultData;

        return html`
            <ha-card class="Parasitic-Control">
                <div class="SingleEntry">
                    <div class="description" id="btn_descr">Parasitic Control</div>
                    <div class="button_cont">
                        <ha-switch id="par_ctrl_btn" @click="${this.ParControl}"></ha-switch>
                    </div>
                </div>
                <div class="par_ctrl_settings SingleEntry" id="par_ctrl_settings">
                    <div class="manual_thr" id="manual_thr">
                        <div class="description" id="par_ctrl_descr"> Manual Threshold : </div>
                        <ha-textfield class="par_ctrl_input_field" id="par_ctrl_input_field" @click=${this.resetValid}>Power</ha-textfield>
                        <div class="power_unit description" id="power_unit"> W </div>
                    </div>
                    <div class="mode_sel_cont" id="mode_sel_cont">
                        <div class="description"> Mode: </div>
                        <ha-select class="mode_sel" id="mode_sel" label="Choose mode" @selected=${this._onModeSelected}>
                            ${["Manual", "Auto"].map((item) => html`<mwc-list-item .value=${item}>${item}</mwc-list-item>`)}
                        </ha-select>
                    </div>
                </div>
            </ha-card>
        `;
    }

    static style = [
        generalStyles,
        css`
            .Parasitic-Control{
                padding-bottom: 5px;
            }

            .mode_sel_cont{
                display: none;
                flex-wrap: wrap;
                align-content: center;
            }
            
            .par_ctrl_settings{
                display: none;
                flex-wrap: wrap;
                align-content: center;
            }

            .button_cont{
                margin-left: auto;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }

            .manual_thr{
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }

            .par_ctrl_input_field{
                width: 100px;
            }

            .power_unit{
                margin-left: 10px;
            }
        `
    ]

    static get styles() {
        return this.style;
    }
}
customElements.define("parasitic-control", ParasiticControl);