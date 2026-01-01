---
title: Working with IP Addresses in Opteryx - SQL IP Functions
description: Query and manipulate IP addresses in Opteryx. Perform containment testing and IP operations with SQL.
---

# Working with IPs

IP addresses are represented as `VARCHAR` or `VARBINARY` values and support containment testing operations. `VARBINARY` is the preferred type for storing IP addresses.

## Actions

### Create

IP addresses are created as string literals:

~~~sql
'192.168.0.1'
'2001:0db8:85a3:0000:0000:8a2e:0370:7334'
'192.168.0.0/24'
~~~

For `VARBINARY` storage (preferred):

~~~sql
b'192.168.0.1'
b'2001:0db8:85a3:0000:0000:8a2e:0370:7334'
b'192.168.0.0/24'
~~~

### Reading

IP addresses can be read directly as string values from columns:

~~~sql
SELECT ip_address
  FROM network_logs;
~~~

### Comparing

#### Containment Testing

The `|` operator tests if an IP address is contained within a CIDR block:

~~~sql
ip_address | cidr_block
~~~

Example:

~~~sql
SELECT *
  FROM network_logs
 WHERE '192.168.0.1' | '192.168.0.0/24';
~~~

This returns `true` if the IP address is within the specified CIDR range.

~~~sql
SELECT *
  FROM network_logs
 WHERE ip_address | '10.0.0.0/8';
~~~

#### Equality

IP addresses can be compared for equality using standard comparison operators:

~~~sql
SELECT *
  FROM network_logs
 WHERE ip_address = '192.168.0.1';
~~~

## Limitations

IP addresses have the following limitations:

- IP addresses are stored as strings and do not have a dedicated IP data type
- Only containment testing (`|`) and equality comparison are supported
- Mathematical operations on IP addresses are not supported
- IP address validation is not automatically performed
