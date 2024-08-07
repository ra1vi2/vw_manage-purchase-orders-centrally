/***
@controller Name:sap.suite.ui.generic.template.ListReport.view.ListReport,
*@viewId:ui.s2p.mm.pur.central.po.manage.s1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseOrderTP
*/
sap.ui.define([
		"sap/ui/core/mvc/ControllerExtension",
		"sap/m/MessageBox",
		"vwks/nlp/s2p/mm/pocentral/manage/changes/utils/Formatter",
		"vwks/nlp/s2p/mm/reuse/lib/supplierStatus/SupplierStatuses",
		"vwks/nlp/s2p/mm/reuse/lib/util/Formatter",
		"vwks/nlp/s2p/mm/reuse/lib/documentHistory/type/ApplicationType",
		"vwks/nlp/s2p/mm/reuse/lib/documentHistory/DocumentHistoryHelper"
	],
	function (
		ControllerExtension,
		MessageBox,
		Formatter,
		SupplierStatuses,
		ReuseFormatter,
		ApplicationType,
		DocumentHistoryHelper
	) {
		"use strict";
		return ControllerExtension.extend("vwks.nlp.s2p.mm.pocentral.manage.ListReportExtController", {

			override: {
				/*
				 * Extending life cycle method in adaptation app
				 */
				onInit: function () {
					//i18n Resource model for translation
					var oi18nModel = this.getView().getController().getOwnerComponent().getModel("i18n");
					if (oi18nModel) {
						this._oResourceBundle = oi18nModel.getResourceBundle();
					}

					this.oSupplierStatuses = new SupplierStatuses(this.getView(), this._oResourceBundle);
				},

				/*
				 * overriding life cycle method to add additional fields for odata service call 
				 */
				onAfterRendering: function () {
					var aNewRequestedFields = ["SupplierOverallStatus"];
					var oPurchaseOrdersSmartTable = this.base.byId(
						"ui.s2p.mm.pur.central.po.manage.s1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseOrderTP--listReport"
					);
					var sRequestedFields = oPurchaseOrdersSmartTable.getRequestAtLeastFields();
					var aUpdatedRequestedFields = sRequestedFields ? [sRequestedFields].concat(aNewRequestedFields).join(",") : aNewRequestedFields.join(
						",");
					oPurchaseOrdersSmartTable.setRequestAtLeastFields(aUpdatedRequestedFields);
				}
			},

			/**
			 * Return tooltip for supplier status. Formatter is used.
			 * @param {string} sSupplierOverallStatus supplier overall status code
			 * @return {string} tooltip text
			 * @public
			 */
			getSupplierOverallStatusTooltip: function (sSupplierOverallStatus) {
				return ReuseFormatter.getSupplierOverallStatusTooltip(sSupplierOverallStatus, this._oResourceBundle);
			},

			/**
			 * Return icon src. Formatter is used.
			 * @param {string} sSupplierOverallStatus supplier overall status code
			 * @return {string} icon src
			 * @public
			 */
			getSupplierOverallStatusIcon: function (sSupplierOverallStatus) {
				return ReuseFormatter.getSupplierOverallStatusIcon(sSupplierOverallStatus);
			},

			/**
			 * Return icon color. Formatter is used.
			 * @param {string} sSupplierOverallStatus supplier overall status code
			 * @return { sap.ui.core.IconColor} icon color
			 * @public
			 */
			getSupplierOverallStatusState: function (sSupplierOverallStatus) {
				return ReuseFormatter.getSupplierOverallStatusState(sSupplierOverallStatus);
			},

			/**
			 * Supplier Overall Status press event handler.
			 * @param {sap.ui.base.Event} oEvent press event
			 */
			onSupplierOverallStatusPress: function (oEvent) {
				var oSupplierOverallStatusIcon = oEvent.getSource();
				var oPOContext = oSupplierOverallStatusIcon.getBindingContext();
				this.oSupplierStatuses.loadPopover(oSupplierOverallStatusIcon)
					.then(function () {
						this.oSupplierStatuses.setBusy(true);
						return this.oSupplierStatuses.loadSupplierStatus(oPOContext);
					}.bind(this))
					.then(function (oData) {
						this.oSupplierStatuses.setSupplierStatusData(oData);
						this.oSupplierStatuses.setBusy(false);
					}.bind(this))
					.catch(function (oError) {
						this.oSupplierStatuses.setBusy(false);
						if (JSON.parse(oError.responseText)) {
							MessageBox.error(JSON.parse(oError.responseText).error.message.value);
						}
					}.bind(this));
			},
			/*
			 * Open document history dialog
			 * @param {sap.ui.base.Event} oEvent The event object
			 */
			openDocumentHistoryDialog: function (oEvent) {
				DocumentHistoryHelper.openDocumentHistoryDialog(oEvent, this.getView(), ApplicationType.MPOC_HEADER);
			}
		});
	});