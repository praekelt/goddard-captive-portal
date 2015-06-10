/ip dns static add address=192.168.88.50 comment="supports all the apps for mamawifi.com" name=.*.mamawifi.com
/ip dns static add address=192.168.88.50 comment="default page for mamawifi.com" name=mamawifi.com
/ip hotspot walled-garden remove numbers=[/ip hotspot walled-garden find ]
/ip hotspot walled-garden add comment="place hotspot rules here" disabled=yes
/ip hotspot walled-garden add dst-host=goddard.com server=hotspot1
/ip hotspot walled-garden add dst-host=*.goddard.com server=hotspot1
/ip hotspot walled-garden ip add action=accept disabled=no dst-address=192.168.88.50 server=*1
/ip hotspot walled-garden add dst-host=www.mamawifi.com server=hotspot1
/ip hotspot walled-garden add dst-host=*.mamawifi.com server=hotspot1
/ip hotspot walled-garden add dst-host=www.surepmch.org server=hotspot1
/ip hotspot walled-garden add dst-host=*.surepmch.org server=hotspot1
/ip hotspot walled-garden add dst-host=www.surepmch.org server=hotspot1
/ip hotspot walled-garden add dst-host=*.surepmch.org server=hotspot1
/ip hotspot walled-garden add dst-host=surepmchreports.org server=hotspot1
/ip hotspot walled-garden add dst-host=*.surepmchreports.org server=hotspot1
/ip hotspot walled-garden add dst-host=dhis2nigeria.org.ng server=hotspot1
/ip hotspot walled-garden add dst-host=*.dhis2nigeria.org.ng server=hotspot1
/ip hotspot walled-garden add dst-host=nigeriahealthwatch.com server=hotspot1
/ip hotspot walled-garden add dst-host=*.nigeriahealthwatch.com server=hotspot1
/ip hotspot walled-garden add dst-host=health-orb.org server=hotspot1
/ip hotspot walled-garden add dst-host=*.health-orb.org server=hotspot1
/ip hotspot walled-garden add dst-host=babycenter.com server=hotspot1
/ip hotspot walled-garden add dst-host=*.babycenter.com server=hotspot1