/*
 * Copyright (C) 2009-2020 SAP SE or an SAP affiliate company. All rights reserved.
 * @controller Name:sap.suite.ui.generic.template.ObjectPage.view.Details,
 * @viewId:ui.s2p.mm.pur.central.po.manage.s1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseOrderTP
 */
sap.ui.define([
		"sap/ui/core/mvc/ControllerExtension",
		"sap/m/MessageBox",
		"vwks/nlp/s2p/mm/pocentral/manage/changes/utils/Formatter",
		"vwks/nlp/s2p/mm/pocentral/manage/changes/utils/Constants",
		"vwks/nlp/s2p/mm/reuse/lib/supplierStatus/SupplierStatuses",
		"sap/ui/model/json/JSONModel",
		"vwks/nlp/s2p/mm/reuse/lib/util/NavigationHelper",
		"vwks/nlp/s2p/mm/reuse/lib/util/Formatter",
		"vwks/nlp/s2p/mm/reuse/lib/util/Constants",
		"vwks/nlp/s2p/mm/reuse/lib/documentHistory/type/ApplicationType"
	],
	function (
		ControllerExtension,
		MessageBox,
		Formatter,
		Constants,
		SupplierStatuses,
		JSONModel,
		NavigationHelper,
		ReuseFormatter,
		ReuseConstants,
		ApplicationType
	) {
		"use strict";
		return ControllerExtension.extend("vwks.nlp.s2p.mm.pocentral.manage.ObjectPageExtController", {

			override: {
				/**
				 * Extending onInit life cycle method in adaptation app
				 */
				onInit: function () {
					var headerViewId =
						"ui.s2p.mm.pur.central.po.manage.s1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseOrderTP";
					var itemViewId =
						"ui.s2p.mm.pur.central.po.manage.s1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseOrderItemTP";

					switch (this.getView().getId()) {
					case headerViewId:
						this._sCurrentView = "header";
						break;
					case itemViewId:
						this._sCurrentView = "item";
						break;
					default:
						this._sCurrentView = "";
					}

					//i18n Resource model
					var oi18nModel = this.getView().getController().getOwnerComponent().getModel("i18n");
					if (oi18nModel) {
						this._oResourceBundle = oi18nModel.getResourceBundle();
					}
					this.getView().getController().extensionAPI.attachPageDataLoaded(this.bindDocumentHistory.bind(this));
					this.oSupplierStatuses = new SupplierStatuses(this.getView(), this._oResourceBundle);
				}
			},

			/**
			 * Bind Document History composite control.
			 */
			bindDocumentHistory: function () {
				var oDocHistoryData = {};
				if (this._sCurrentView === "header") {
					oDocHistoryData.items = [{
						key: "HI",
						text: this._oResourceBundle.getText("HeaderAndItemsFilterText")
					}, {
						key: "H",
						text: this._oResourceBundle.getText("HeaderFilterText")
					}, {
						key: "I",
						text: this._oResourceBundle.getText("AllItemsFilterText")
					}];
					oDocHistoryData.application = ApplicationType.MPOC_HEADER;
				} else if (this._sCurrentView === "item") {
					oDocHistoryData.items = [{
						key: "HI",
						text: this._oResourceBundle.getText("HeaderAndItemFilterText")
					}, {
						key: "I",
						text: this._oResourceBundle.getText("ItemFilterText")
					}];
					oDocHistoryData.application = ApplicationType.MPOC_ITEM;
				}

				var oDocHistoryModel = new JSONModel(oDocHistoryData);
				this.byId("idDocHistorySection").setModel(oDocHistoryModel, "docHistory");
				this.byId("idDocumentHistory").loadDocumentHistory();
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

			/**
			 * PFO link press event handler.
			 * @param {sap.ui.base.Event} oEvent press event object
			 */
			onPFOLinkPress: function () {
				var oPOData = this.getView().getBindingContext().getObject();

				var oParams = {
					Document: oPOData.ProcurementHubPO,
					DocumentType: Constants.PO_DOC_TYPE,
					SourceSystem: oPOData.ExtSourceSystem,
					DocumentGuid: ReuseConstants.INITIAL_GUID
				};
				NavigationHelper.navigateToExternalApp(this.getView().getController(), "PFO", null, oParams, true);
			}

		});
	});