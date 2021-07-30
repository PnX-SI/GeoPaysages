import ftplib
import os
import re
import ssl

from geopaysagesftpclient.patterns import (
    build_string_from_pattern,
    inputpattern_to_regex,
    lower_and_replace
)


class gpClient(ftplib.FTP_TLS):
    '''Extends ftplib.FTP_TLS to provide the necessary features for the image retrieval pipeline ftp-component.'''
    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)

        if self._prot_p:
            conn = self.context.wrap_socket(
                conn,
                server_hostname=self.host,
                session=self.sock.session
            )
        return conn, size

    def listdir(self, path='.'):
        '''List a dir and yields the dir content together with a flag 'f' (for file) or 'd' (for directory) for each item of the dir'''
        result = []
        self.dir(path, result.append)

        for desc in result:
            f = (path + '/' if path != '.' else '') + desc.split(' ')[-1]

            if desc.startswith('d'):
                yield (f, 'd')
            else:
                yield (f, 'f')

    def walk_dir(self, compiled_regexp, current_dir:str='.'):
        '''Walks a dir and yields the files that match the given compiled_regexp together with their matchdict'''
        for (f,t) in self.listdir(current_dir):
            if t == 'd':    #if the dir item is a dir, explore it
                yield from self.walk_dir(compiled_regexp, current_dir=f)
            else:           # otherwise, check if the file matches the input_pattern, if so, return it together with its match groupdict
                match = compiled_regexp.fullmatch(f)
                if match:
                    g = dict(match.groupdict(), path=f, filename=f.split('/')[-1]) #Building the file's groupdict
                    yield (f, g)

    def retrieve_images(
            self,
            site,
            input_pattern:str,
            output_pattern:str=r'{site}/{Y}{M}{D}_{filename}',
            outputdir='output',
            filter=lambda f,g: True
        ):
        regexp = re.compile(inputpattern_to_regex(input_pattern))

        for f,g in ( (_f,dict(_g,site=site)) for _f,_g in self.walk_dir(regexp)):
            if filter(f,g):
                ofname  = lower_and_replace(build_string_from_pattern(output_pattern, g))
                destfile= os.path.join(outputdir, ofname)

                if not os.path.isfile(destfile):                        # Only retrieve an image we do not already have it
                    if not os.path.isdir(os.path.dirname(destfile)):    # If the output file dir does not exist, create it.
                        os.makedirs(os.path.dirname(destfile))          # Note: the output dir may vary per file

                    with open(destfile,'wb') as of:
                        self.retrbinary('RETR {0}'.format(g['path']), of.write)
                        yield (destfile, dict(g, ofilename=ofname))
