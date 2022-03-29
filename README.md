<h6 align="right">
	<span>:uk: English</span> <!-- &#124; <a href="/README-xx.md">:xx: Xx</a> -->
</h6>

<h1 align="center">
	<span>Node HTTP Template</span><br />
	<!-- Workflow files/badges -->
	<a href="">
		<img alt="" src="" />
	</a>
</h1>

> :bulb: **Tip**<br />
> This is a template repository. You can use it by clicking the "Use this template" button on our GitHub repository or by specifying the `--template kerig-it/node-http-template` option when creating the repository [using the GitHub CLI](https://cli.github.com/manual/gh_repo_create).

## Synopsis

This repository is a small HTTP web server written in Node.js that you can use to serve your client with minimal configuration.

<table/>
	<tr>
		<th>Table of Contents</th>
	</tr>
	<tr>
		<td>
			<ul>
				<li>
					<a href="#notice">Notice</a>
				</li>
				<li>
					<a href="#configuration">Configuration</a>
				</li>
				<li>
					<a href="#support">Support</a>
				</li>
			</ul>
		</td>
	</tr>
</table>

## Notice

This repository is licenced under [the MIT licence](https://mit-license.org). To have a full picture of your rights and responsibilities, refer to the licence file in this repository's root as [`LICENCE`](/LICENCE).

## Configuration

There are several things you can configure to alter the server's behaviour by changing certain values in the [`config.json`](/config.json) file. Use the below table as a reference for all properties, their default value and description.

<table>
	<tr>
		<th>Property</th>
		<th>Type</th>
		<th>Default value</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><code>client</code></td>
		<td>Object</td>
		<td><table>
			<tr>
				<th>Property</th>
				<th>Type</th>
				<th>Default value</th>
				<th>Description</th>
			</tr>
			<tr>
				<td><code>dir</code></td>
				<td>String</td>
				<td><code>../webpack-template/dist</code></td>
				<td>Defines the path name to the client directory that the server is supposed to make public.</td>
			</tr>
		</table></td>
		<td>Holds properties about the client.</td>
	</tr>
	<tr>
		<td><code>cors</code></td>
		<td>Object</td>
		<td><table>
			<tr>
				<th>Property</th>
				<th>Type</th>
				<th>Default value</th>
				<th>Description</th>
			</tr>
			<tr>
				<td><code>domains</code></td>
				<td>Array</td>
				<td><table>
					<tr>
						<th>Item</th>
						<th>Type</th>
					</tr>
					<tr>
						<td><code>127.0.0.1</code></td>
						<td>String</td>
					</tr>
					<tr>
						<td><code>localhost</code></td>
						<td>String</td>
					</tr>
				</table></td>
				<td>Defines a list of whitelisted domain names for CORS header assignment.</td>
			</tr>
		</table></td>
		<td>Holds properties about CORS management.</td>
	</tr>
	<tr>
		<td><code>devServer</code></td>
		<td>Object</td>
		<td><table>
			<tr>
				<th>Property</th>
				<th>Type</th>
				<th>Default value</th>
				<th>Description</th>
			</tr>
			<tr>
				<td><code>port</code></td>
				<td>Number</td>
				<td><code>8080</code></td>
				<td>Defines a port that the server will listen on if the <code>environment</code> property is set to <code>development</code>.</td>
			</tr>
		</table></td>
		<td>Holds properties about the development server.</td>
	</tr>
	<tr>
		<td><code>environment</code></td>
		<td>String</td>
		<td><code>development</code></td>
		<td>Defines the environment of the server. The two possible values are <code>development</code> and <code>production</code>.</td>
	</tr>
	<tr>
		<td><code>methods</code></td>
		<td>Array</td>
		<td><table>
				<tr>
					<th>Item</th>
					<th>Type</th>
				</tr>
				<tr>
					<td><code>GET</code></td>
					<td>String</td>
				</tr>
				<tr>
					<td><code>HEAD</code></td>
					<td>String</td>
				</tr>
				<tr>
					<td><code>OPTIONS</code></td>
					<td>String</td>
				</tr>
			</table></td>
		<td>Defines a list of HTTP methods that the server will not reject with a <code>405 Method Not Allowed</code> status.</td>
	</tr>
	<tr>
		<td><code>server</code></td>
		<td>Object</td>
		<td><table>
			<tr>
				<th>Property</th>
				<th>Type</th>
				<th>Default value</th>
				<th>Description</th>
			</tr>
			<tr>
				<td><code>port</code></td>
				<td>Number</td>
				<td><code>80</code></td>
				<td>Defines a port that the server will listen on if the <code>environment</code> property is set to <code>production</code>.</td>
			</tr>
		</table></td>
		<td>Holds properties about the production server.</td>
	</tr>
	<tr>
		<td><code>timeout</code></td>
		<td>Number</td>
		<td><code>5000</code></td>
		<td>Defines a timeout in milliseconds after which the server will automatically end the response with the <code>408 Request Timeout</code> status.</td>
	</tr>
</table>

## Support

Ran into problems or have questions? Don't hesitate to get in touch with us by either sending an e-mail to one of this repository contributors or organisation members, [filing an issue](https://github.com/kerig-it/node-tmpl/issues/new/choose) on our GitHub repository or [opening a discussion](https://github.com/kerig-it/node-tmpl/discussions/new).

If you want to send an e-mail, you can choose from one of the below e-mail addresses:

 - <msfninja@pm.me> ([@msfninja](https://github.com/msfninja), contributor)
 - <sosa@ctemplar.com> ([@milkoholic](https://github.com/milkoholic), member)

> :bulb: **Tip**<br />
> You can also join our `#kerig` channel on [irc.libera.chat](https://libera.chat) or [chat.freenode.net](https://freenode.net)!
