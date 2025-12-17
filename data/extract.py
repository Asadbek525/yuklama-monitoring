with open("stg-1.txt", 'r', encoding='utf-8') as infile:
  lines = infile.read().split('\n')
  aerob = []
  aralash = []
  anaerob = []
  sakrash = []
  sport = []
  maxsus = []
  i = 0
  for line in lines:
    if i % 6 == 0:
      aerob.append(float(line))
    elif i % 6 == 1:
      aralash.append(float(line))
    elif i % 6 == 2:
      anaerob.append(float(line))
    elif i % 6 == 3:
      sakrash.append(float(line))
    elif i % 6 == 4:
      if line:
        sport.append(1)
      else:
        sport.append(0)
    elif i % 6 == 5:
      if line:
        maxsus.append(1)
      else:
        maxsus.append(0)
    i += 1

  with open("stg-1.ts", 'w', encoding='utf-8') as outfile:
    outfile.write(f"export const aerob: number[] = {aerob};\n")
    outfile.write(f"export const aralash: number[] = {aralash};\n")
    outfile.write(f"export const anaerob: number[] = {anaerob};\n")
    outfile.write(f"export const sakrash: number[] = {sakrash};\n")
    outfile.write(f"export const sport: number[] = {sport};\n")
    outfile.write(f"export const maxsus: number[] = {maxsus};\n")


