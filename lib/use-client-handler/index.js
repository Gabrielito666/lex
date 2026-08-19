/**
 * @file
 * @source lib/use-client-handler/index.js
 * @description The stack to use and controll the useClient callbacks
 */

const UseClientHandler = class
{
	/**@type {(() =>any)[]}*/
	#stack = [];
	/**@type {boolean}*/
	#prevToMount = true;
	
	/**
	 * @param {()=>any} cb
	 * @returns {void}
	 */
	add(cb)
	{
		if(this.#prevToMount)
		{
			this.#stack.push(cb);
			return;
		}
		cb();
	}
	setPostMountMode()
	{
		this.#prevToMount = false;
		
		while(true)
		{
			const cb = this.#stack.shift();
			if(!cb) break;
			cb();
		}
	}
}

export default UseClientHandler;
