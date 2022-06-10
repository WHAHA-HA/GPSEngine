
import csv

def process(f):
	c = csv.reader(f)
	headings = c.next()
	iLat = headings.index('Latitude')
	iLong = headings.index('Longitude')
	iSpeed = headings.index('Speed')
	iTime = headings.index('Time')
	iHeading = headings.index('Heading')
	plots = []
	for line in c:
		if len(line) == 0:
			continue
		#assert len(line) == 14
		lat = line[iLat]
		lon = line[iLong]
		speed = line[iSpeed]
		time = line[iTime]
		heading = line[iHeading]

		if lat and lon:
			plots.append((lat, lon, speed, time, heading))
	
	for lat, lon, speed, time, heading in plots:
		print '{"lat":%s, "lon":%s, "speed":%s, "time":"%s", "heading":%s},' % (lat, lon, speed, time, heading)


if __name__ == '__main__':
	process(file('Sample.csv'))

