
import csv

def process(f):
	c = csv.reader(f)
	headings = c.next()
	iName = headings.index('Common Name')
	iCode = headings.index('ISO 3166-1 2 Letter Code')
	countries = []
	for line in c:
		if len(line) == 0:
			continue
		assert len(line) == 14
		name = line[iName]
		code = line[iCode]
		if name and code:
			countries.append((name, code))
	countries.sort()
	for name, code in countries:
		print '{"code":"%s", "name":"%s"},' % (code, name)


if __name__ == '__main__':
	process(file('countries.csv'))

