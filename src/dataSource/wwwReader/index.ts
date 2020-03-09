import path from 'path';
import stream from 'stream';

import tar from 'tar';
import axios from 'axios';

import * as rr from '../../result';


const getListURL = `https://cran.r-project.org/src/contrib/PACKAGES`;

const getItemURL = (name: string, version: string) =>
    `https://cran.r-project.org/src/contrib/${name}_${version}.tar.gz`;


export const getListData = async (): Promise<rr.Result<string, string>> => {
    try {
        const axiosGetResult = await axios.get(getListURL);
        const data = axiosGetResult.data;
        if (typeof data !== 'string') {
            return rr.err(`Error while getting data from ${getListURL}: Did not receive a text or string from the URL.`);
        }
        // ---
        return rr.ok(data);
    } catch (e) {
        return rr.err(`[getListData] Error while getting data from ${getListURL}: ${e.toString()}`);
    }
};
    
export const getPackageDescriptionFile = async (name: string, version: string): Promise<rr.Result<string, string>> => {
    const url = getItemURL(name, version);
    try {
        const axiosResponse = await axios.get(url, { responseType: 'stream' });
        const axiosResponseStream: stream.Readable = axiosResponse.data;
        // ---
        // Untar the ${name}/DESCRIPTION file into a string
        const descriptionChunks: any[] = [];
        const tarStream = axiosResponseStream.pipe(
            tar.t({
                onentry: (entry) => {
                    entry.on('data', chunk => {
                        descriptionChunks.push(chunk);
                    });
                },
            }, [`${name}/DESCRIPTION`])
        );
        await new Promise(resolve => tarStream.on('finish', resolve));
        const descriptionData = descriptionChunks.toString();
        return rr.ok(descriptionData);
    } catch (err) {
        return rr.err(`[getPackageDescriptionFile] Error while getting description file from url [${url}]: ${err.toString()}`);
    }
};
