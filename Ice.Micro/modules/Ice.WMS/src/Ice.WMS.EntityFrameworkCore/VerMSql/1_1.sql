begin;
UPDATE WMS.WMSOutboundOrder SET RecvContact = Contact;
UPDATE WMS.WMSOutboundOrder SET RecvContactNumber = ContactNumber;
UPDATE WMS.WMSOutboundOrder SET RecvAddressDetail = Address;
UPDATE WMS.WMSOutboundOrder SET RecvPostcode = Postcode;
UPDATE WMS.WMSWarehouse SET AddressDetail = Address;
commit;