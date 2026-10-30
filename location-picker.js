const cities = {
 DE:[['Berlin',52.52,13.4],['Hamburg',53.55,10],['München',48.14,11.58],['Köln',50.94,6.96],['Frankfurt',50.11,8.68]],
 GB:[['London',51.51,-.13],['Manchester',53.48,-2.24],['Edinburgh',55.95,-3.19]],
 US:[['New York',40.71,-74.01],['Los Angeles',34.05,-118.24],['Chicago',41.88,-87.63]],
 ES:[['Madrid',40.42,-3.7],['Barcelona',41.39,2.17],['Valencia',39.47,-.38]],
 FR:[['Paris',48.86,2.35],['Marseille',43.3,5.37],['Lyon',45.76,4.84]],
 CA:[['Toronto',43.65,-79.38],['Montréal',45.5,-73.57],['Vancouver',49.28,-123.12]],
 MX:[['Ciudad de México',19.43,-99.13],['Guadalajara',20.67,-103.35]],
 BR:[['São Paulo',-23.55,-46.63],['Rio de Janeiro',-22.91,-43.17]],
 IN:[['Delhi',28.61,77.21],['Mumbai',19.08,72.88],['Bengaluru',12.97,77.59]],
 JP:[['Tokyo',35.68,139.69],['Osaka',34.69,135.5]],
 AU:[['Sydney',-33.87,151.21],['Melbourne',-37.81,144.96],['Perth',-31.95,115.86]],
 IT:[['Roma',41.9,12.5],['Milano',45.46,9.19]],NL:[['Amsterdam',52.37,4.9],['Rotterdam',51.92,4.48]],
 PL:[['Warszawa',52.23,21.01],['Kraków',50.06,19.94]],AR:[['Buenos Aires',-34.6,-58.38],['Córdoba',-31.42,-64.19]],
 ZA:[['Johannesburg',-26.2,28.05],['Cape Town',-33.92,18.42]],ID:[['Jakarta',-6.21,106.85],['Surabaya',-7.25,112.75]],
 PH:[['Manila',14.6,120.98],['Cebu',10.32,123.89]],NZ:[['Auckland',-36.85,174.76],['Wellington',-41.29,174.78]]
};
const texts = {
 de:['Stadt oder eigener Punkt','Nur Land','Punkt auf Karte setzen','Ungefähren Ort wählen; keine Privatadresse. Der Punkt wird mit deiner Nachricht öffentlich.','Breitengrad','Längengrad','Karte nicht verfügbar. Du kannst unten Koordinaten eingeben.'],
 en:['City or custom point','Country only','Choose a point on the map','Choose an approximate location, not your home address. The point becomes public with your message.','Latitude','Longitude','Map unavailable. You can enter coordinates below.'],
 es:['Ciudad o punto propio','Solo país','Elegir punto en el mapa','Elige una ubicación aproximada, no tu domicilio. El punto será público con tu mensaje.','Latitud','Longitud','Mapa no disponible. Puedes introducir coordenadas abajo.']
};
export function setupLocationPicker(form, language) {
 const t=texts[language], country=form.elements.country;
 const box=document.createElement('div');box.className='location-picker';
 box.innerHTML=`<label>${t[0]}<select name="city" disabled></select></label><p class="note">${t[3]}</p><div class="custom-location" hidden><div class="location-map" role="region" aria-label="${t[2]}" tabindex="0"></div><div class="coordinates"><label>${t[4]}<input name="latitude" type="number" min="-90" max="90" step="0.01"></label><label>${t[5]}<input name="longitude" type="number" min="-180" max="180" step="0.01"></label></div></div><p class="location-status note" role="status"></p>`;
 country.closest('label').after(box);
 const select=form.elements.city,lat=form.elements.latitude,lng=form.elements.longitude,custom=box.querySelector('.custom-location'),status=box.querySelector('.location-status');
 let map=null,marker=null;
 function sync(){if(lat.value!==''&&lng.value!==''&&lat.validity.valid&&lng.validity.valid){const point=[Number(lat.value),Number(lng.value)];status.textContent=point.join(', ');if(map){if(!marker)marker=L.marker(point).addTo(map);else marker.setLatLng(point)}}}
 function choose(){custom.hidden=select.value!=='custom';lat.required=lng.required=!custom.hidden;lat.disabled=lng.disabled=custom.hidden;status.textContent='';if(custom.hidden)return;
 if(!map&&typeof L!=='undefined'){
 map=L.map(box.querySelector('.location-map'),{scrollWheelZoom:false}).setView((cities[country.value]?.[0]||['',20,0]).slice(1),4);
 L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',{attribution:'&copy; OpenStreetMap &copy; CARTO',maxZoom:12}).addTo(map);
 map.on('click',e=>{lat.value=e.latlng.lat.toFixed(2);lng.value=((e.latlng.lng+180)%360+360)%360-180;lng.value=Number(lng.value).toFixed(2);sync()});
 }else if(!map)box.querySelector('.location-map').textContent=t[6];
 map?.invalidateSize();sync();
 }
 function reset(){select.replaceChildren(new Option(t[1],''));(cities[country.value]||[]).forEach(([name],i)=>select.add(new Option(name,String(i))));select.add(new Option(t[2],'custom'));select.disabled=!country.value;lat.value=lng.value='';if(marker){marker.remove();marker=null}map?.setView((cities[country.value]?.[0]||['',20,0]).slice(1),4);choose()}
 country.addEventListener('change',reset);select.addEventListener('change',choose);lat.addEventListener('input',sync);lng.addEventListener('input',sync);reset();
 return {value(){if(select.value==='custom')return {latitude:Number(lat.value),longitude:Number(lng.value)};const city=cities[country.value]?.[Number(select.value)];return select.value!==''&&city?{city:city[0],latitude:city[1],longitude:city[2]}:{}},reset,dispose(){map?.remove()}};
}
