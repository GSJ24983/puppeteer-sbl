import json,io,os
eng=open('player_template.html').read()
sample=open('sample_scenario.json').read()
docs=open('docs.html').read()
shell=open('studio_shell.html').read()

# escape closing script tags so the embedded template survives inside <script type=text/plain>
eng_esc=eng.replace('</script>','<\\/script>')
docs_esc=docs.replace('</script>','<\\/script>')
sample_esc=sample.replace('</script>','<\\/script>')

out=shell.replace('__ENGINE_SRC__',eng_esc).replace('__SAMPLE_JSON__',sample_esc).replace('__DOCS__',docs_esc)
os.makedirs('/mnt/user-data/outputs',exist_ok=True)
open('/mnt/user-data/outputs/puppeteer_studio_v0_1.html','w').write(out)
print('studio bytes',len(out))
# also emit a ready standalone of the sample by doing the same substitution the browser does
j=json.loads(sample)
title=(j.get('deckTitle','The Puppeteer'))+' - '+j['scenarios'][0]['title']
s=eng.replace('__DECK_TITLE__',title)
a=s.index('/*__SCENARIO_JSON__*/'); b=s.index('/*__END__*/')
s=s[:a]+json.dumps(j,indent=1)+s[b+len('/*__END__*/'):]
open('/mnt/user-data/outputs/sample_signoff_standalone.html','w').write(s)
print('standalone bytes',len(s))
